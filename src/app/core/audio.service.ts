import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ProfileService } from './profile.service';
import { SettingsService, SpeechLang } from './settings.service';

/** Voix anglaise sélectionnable (homme/femme, GB/US…) telle que proposée par l'appareil. */
export interface VoiceOption {
  /** Identifiant stable (voiceURI) à persister. */
  uri: string;
  /** Libellé lisible (nom + langue). */
  label: string;
  /** Code langue de la voix (ex. en-GB). */
  lang: string;
}

interface RawVoice {
  voiceURI?: string;
  name?: string;
  lang?: string;
  /** `true` si la voix est synthétisée localement (hors-ligne) ; `false` = voix serveur (latence réseau). */
  localService?: boolean;
}

/**
 * Prononciation (anglais et français).
 * - Sur Android (plateforme native) : plugin natif Capacitor (moteur TTS du téléphone, hors-ligne).
 * - Dans le navigateur (ng serve)   : Web Speech API en repli.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly native = Capacitor.isNativePlatform();
  private readonly profiles = inject(ProfileService);
  private readonly settings = inject(SettingsService);

  /** `true` si aucune voix anglaise n'est disponible (prononciation muette). */
  readonly unavailable = signal(false);
  /** Voix anglaises disponibles sur l'appareil (pour le choix dans les Réglages). */
  readonly voices = signal<VoiceOption[]>([]);
  /** Voix françaises disponibles sur l'appareil (pour le choix dans les Réglages). */
  readonly voicesFr = signal<VoiceOption[]>([]);

  /** Voix natives brutes (pour retrouver l'index attendu par le plugin à partir d'un voiceURI). */
  private nativeVoices: RawVoice[] = [];

  constructor() {
    if (this.native) {
      this.checkNativeVoices();
      this.loadNativeVoices();
    } else {
      this.primeWebVoices();
    }
  }

  /**
   * Prononce un texte (lent, adapté aux enfants).
   * `rateOverride` (0.5–1.0) force une vitesse précise (ex. test depuis l'Admin) ;
   * sinon on applique la vitesse réglée pour le profil courant.
   * `lang` permet de prononcer en français (`fr-FR`) ; défaut anglais (`en-US`).
   * `voiceUriOverride` force une voix précise (ex. aperçu depuis l'Admin) ; sinon, en anglais,
   * on applique la voix choisie pour le profil courant.
   */
  async speak(text: string, rateOverride?: number, lang = 'en-US', voiceUriOverride?: string): Promise<void> {
    const langKey: SpeechLang = lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    const rate = rateOverride ?? this.profileRate(langKey);
    const uri = voiceUriOverride ?? this.profileVoice(langKey);
    if (this.native) {
      try {
        await TextToSpeech.stop();
      } catch {
        /* rien à arrêter */
      }
      try {
        const idx = this.pickNativeVoice(lang, uri);
        await TextToSpeech.speak({
          text,
          lang: idx >= 0 && this.nativeVoices[idx].lang ? (this.nativeVoices[idx].lang as string) : lang,
          rate,
          pitch: 1.1,
          volume: 1.0,
          category: 'ambient',
          ...(idx >= 0 ? { voice: idx } : {}),
        });
      } catch (e) {
        console.warn('TTS natif indisponible', e);
      }
      return;
    }
    this.speakWeb(text, rate, lang, uri);
  }

  /** Prononce un texte en français (bouton drapeau FR du mode entraînement). */
  speakFr(text: string): Promise<void> {
    return this.speak(text, undefined, 'fr-FR');
  }

  /** Vitesse (0.5–1.0) déduite du réglage % du profil courant, pour la langue donnée. */
  private profileRate(lang: SpeechLang): number {
    const id = this.profiles.current()?.id;
    const percent = id ? this.settings.rateFor(id, lang) : 90;
    return percent / 100;
  }

  /** voiceURI choisi pour le profil courant dans la langue donnée (vide = défaut). */
  private profileVoice(lang: SpeechLang): string {
    const id = this.profiles.current()?.id;
    return id ? this.settings.voiceFor(id, lang) : '';
  }

  /**
   * Choisit l'index de voix native pour `speak`.
   * - Si `uri` est fourni (voix explicitement choisie pour l'anglais), on le respecte.
   * - Sinon, parmi les voix de la bonne langue, on **préfère une voix locale** (`localService`)
   *   à une voix serveur. C'est le point clé pour le français : Google propose souvent une jolie
   *   voix *en ligne* par défaut → latence réseau à chaque nouveau mot. Forcer la voix locale
   *   (si installée) rend la prononciation instantanée et hors-ligne.
   * Retourne -1 si aucune voix correspondante (le moteur utilisera alors son défaut via `lang`).
   */
  private pickNativeVoice(lang: string, uri: string): number {
    if (uri) {
      const i = this.nativeVoices.findIndex((v) => v.voiceURI === uri);
      if (i >= 0) return i;
    }
    const prefix = lang.slice(0, 2).toLowerCase();
    const matches = this.nativeVoices
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => v.lang?.toLowerCase().startsWith(prefix));
    const local = matches.find(({ v }) => v.localService);
    return (local ?? matches[0])?.i ?? -1;
  }

  /** Vérifie qu'une voix anglaise est installée (TTS natif). */
  private async checkNativeVoices(): Promise<void> {
    try {
      const res = await TextToSpeech.getSupportedLanguages();
      const langs = (res?.languages ?? []) as string[];
      const hasEnglish = langs.some((l) => String(l).toLowerCase().startsWith('en'));
      this.unavailable.set(!hasEnglish);
    } catch {
      /* API indisponible : on n'affiche pas de fausse alerte */
    }
  }

  /** Charge les listes de voix (anglaises et françaises) proposées par le moteur natif. */
  private async loadNativeVoices(): Promise<void> {
    try {
      const res = await TextToSpeech.getSupportedVoices();
      const all = (res?.voices ?? []) as RawVoice[];
      this.nativeVoices = all;
      this.voices.set(this.toOptions(all, 'en'));
      this.voicesFr.set(this.toOptions(all, 'fr'));
    } catch {
      /* getSupportedVoices indisponible : pas de choix de voix, on garde le défaut */
    }
  }

  // ----- Web Speech API -----

  private primeWebVoices(): void {
    const synth = window.speechSynthesis;
    if (!synth) {
      this.unavailable.set(true);
      return;
    }
    const load = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) return; // pas encore chargées
      this.unavailable.set(!voices.some((v) => v.lang?.toLowerCase().startsWith('en')));
      this.voices.set(this.toOptions(voices, 'en'));
      this.voicesFr.set(this.toOptions(voices, 'fr'));
    };
    load();
    synth.addEventListener?.('voiceschanged', load);
  }

  /** Filtre les voix d'une langue (`en`/`fr`) et les transforme en options affichables (libellés uniques). */
  private toOptions(voices: RawVoice[], prefix: SpeechLang): VoiceOption[] {
    let list = voices.filter((v) => v.lang?.toLowerCase().startsWith(prefix) && v.voiceURI);
    // Sur l'appareil : ne proposer que les voix LOCALES (installées hors-ligne). Les voix serveur
    // (ex. anglais nigérian/indien, ou français canadien en ligne) apparaissent sinon mais ne sont
    // pas installées → sélection sans effet et latence réseau. On ne garde tout que s'il n'y a
    // aucune voix locale.
    if (this.native) {
      const local = list.filter((v) => v.localService);
      if (local.length) list = local;
    }
    const options = list.map((v) => ({
      uri: v.voiceURI as string,
      lang: v.lang ?? 'en',
      label: this.native
        ? this.nativeLabel(v.voiceURI as string, v.lang ?? 'en')
        : this.cleanLabel(v.name ?? (v.voiceURI as string), v.lang ?? 'en'),
    }));
    return this.uniquifyLabels(options);
  }

  /**
   * Libellé natif lisible dérivé du `voiceURI` (ex. `en-us-x-sfg#female_1-local`), car le plugin
   * ne fournit comme `name` que « langue + pays » (identique pour toutes les voix d'une même région).
   * → « US · Femme 1 (en-US) ».
   */
  private nativeLabel(uri: string, lang: string): string {
    const region = (lang.split('-')[1] || lang).toUpperCase();
    const u = uri.toLowerCase();
    const gender = /female/.test(u) ? 'Femme' : /male/.test(u) ? 'Homme' : '';
    const num = (u.match(/(?:female|male)[\D]*(\d+)/) ?? [])[1] ?? '';
    const parts = [region, gender, num].filter(Boolean);
    return `${parts.join(' ')} (${lang})`;
  }

  /** Garantit des libellés distincts (suffixe numérique en cas de doublon). */
  private uniquifyLabels(options: VoiceOption[]): VoiceOption[] {
    const seen = new Map<string, number>();
    return options.map((o) => {
      const n = (seen.get(o.label) ?? 0) + 1;
      seen.set(o.label, n);
      return n === 1 ? o : { ...o, label: `${o.label} · ${n}` };
    });
  }

  /**
   * Libellé court et lisible : on retire le fournisseur (Google/Microsoft…) et le mot « English »,
   * on traduit Male/Female, et on ajoute le code langue. Évite le débordement de la liste déroulante.
   */
  private cleanLabel(name: string, lang: string): string {
    let s = name
      .replace(/\b(google|microsoft|android|samsung|chrome os)\b/gi, '')
      .replace(/\benglish\b/gi, '')
      .replace(/\bmale\b/gi, 'Homme')
      .replace(/\bfemale\b/gi, 'Femme')
      .replace(/[-–]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s) s = lang.toUpperCase();
    const label = `${s} (${lang})`;
    const MAX = 28;
    return label.length > MAX ? label.slice(0, MAX - 1).trimEnd() + '…' : label;
  }

  private speakWeb(text: string, rate: number, lang = 'en-US', uri = ''): void {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    utter.pitch = 1.1;
    const all = synth.getVoices();
    const prefix = lang.slice(0, 2).toLowerCase();
    const matches = all.filter((v) => v.lang?.toLowerCase().startsWith(prefix));
    const voice =
      (uri && all.find((v) => v.voiceURI === uri)) ||
      matches.find((v) => v.localService) ||
      matches[0];
    if (voice) {
      utter.voice = voice;
      if (voice.lang) utter.lang = voice.lang;
    }
    synth.speak(utter);
  }
}
