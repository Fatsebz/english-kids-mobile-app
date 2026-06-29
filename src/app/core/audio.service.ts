import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ProfileService } from './profile.service';
import { SettingsService } from './settings.service';

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
    const rate = rateOverride ?? this.profileRate();
    const isEnglish = lang.toLowerCase().startsWith('en');
    const uri = isEnglish ? (voiceUriOverride ?? this.profileVoice()) : '';
    if (this.native) {
      try {
        await TextToSpeech.stop();
      } catch {
        /* rien à arrêter */
      }
      try {
        const idx = uri ? this.nativeVoices.findIndex((v) => v.voiceURI === uri) : -1;
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

  /** Vitesse (0.5–1.0) déduite du réglage % du profil courant. */
  private profileRate(): number {
    const id = this.profiles.current()?.id;
    const percent = id ? this.settings.rateFor(id) : 90;
    return percent / 100;
  }

  /** voiceURI choisi pour le profil courant (vide = défaut). */
  private profileVoice(): string {
    const id = this.profiles.current()?.id;
    return id ? this.settings.voiceFor(id) : '';
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

  /** Charge la liste des voix anglaises proposées par le moteur natif. */
  private async loadNativeVoices(): Promise<void> {
    try {
      const res = await TextToSpeech.getSupportedVoices();
      const all = (res?.voices ?? []) as RawVoice[];
      this.nativeVoices = all;
      this.voices.set(this.toOptions(all));
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
      this.voices.set(this.toOptions(voices));
    };
    load();
    synth.addEventListener?.('voiceschanged', load);
  }

  /** Filtre les voix anglaises et les transforme en options affichables. */
  private toOptions(voices: RawVoice[]): VoiceOption[] {
    return voices
      .filter((v) => v.lang?.toLowerCase().startsWith('en') && v.voiceURI)
      .map((v) => ({
        uri: v.voiceURI as string,
        lang: v.lang ?? 'en',
        label: this.cleanLabel(v.name ?? (v.voiceURI as string), v.lang ?? 'en'),
      }));
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
    const voice =
      (uri && all.find((v) => v.voiceURI === uri)) ||
      all.find((v) => v.lang?.toLowerCase().startsWith(prefix));
    if (voice) {
      utter.voice = voice;
      if (voice.lang) utter.lang = voice.lang;
    }
    synth.speak(utter);
  }
}
