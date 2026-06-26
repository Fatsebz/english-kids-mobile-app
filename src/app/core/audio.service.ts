import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ProfileService } from './profile.service';
import { SettingsService } from './settings.service';

/**
 * Prononciation en anglais.
 * - Sur Android (plateforme native) : plugin natif Capacitor (moteur TTS du téléphone, hors-ligne).
 * - Dans le navigateur (ng serve)   : Web Speech API en repli.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly native = Capacitor.isNativePlatform();
  private readonly profiles = inject(ProfileService);
  private readonly settings = inject(SettingsService);
  private voicesReady = false;

  constructor() {
    if (!this.native) {
      this.primeWebVoices();
    }
  }

  /**
   * Prononce un texte anglais (lent, adapté aux enfants).
   * `rateOverride` (0.5–1.0) force une vitesse précise (ex. test depuis l'Admin) ;
   * sinon on applique la vitesse réglée pour le profil courant.
   */
  async speak(text: string, rateOverride?: number): Promise<void> {
    const rate = rateOverride ?? this.profileRate();
    if (this.native) {
      try {
        await TextToSpeech.stop();
      } catch {
        /* rien à arrêter */
      }
      try {
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate,
          pitch: 1.1,
          volume: 1.0,
          category: 'ambient',
        });
      } catch (e) {
        console.warn('TTS natif indisponible', e);
      }
      return;
    }
    this.speakWeb(text, rate);
  }

  /** Vitesse (0.5–1.0) déduite du réglage % du profil courant. */
  private profileRate(): number {
    const id = this.profiles.current()?.id;
    const percent = id ? this.settings.rateFor(id) : 90;
    return percent / 100;
  }

  // ----- Web Speech API -----

  private primeWebVoices(): void {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const load = () => {
      this.voicesReady = synth.getVoices().length > 0;
    };
    load();
    synth.addEventListener?.('voiceschanged', load);
  }

  private speakWeb(text: string, rate: number): void {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    utter.pitch = 1.1;
    const enVoice = synth
      .getVoices()
      .find((v) => v.lang?.toLowerCase().startsWith('en'));
    if (enVoice) {
      utter.voice = enVoice;
    }
    synth.speak(utter);
  }
}
