import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Prononciation en anglais.
 * - Sur Android (plateforme native) : plugin natif Capacitor (moteur TTS du téléphone, hors-ligne).
 * - Dans le navigateur (ng serve)   : Web Speech API en repli.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly native = Capacitor.isNativePlatform();
  private voicesReady = false;

  constructor() {
    if (!this.native) {
      this.primeWebVoices();
    }
  }

  /** Prononce un texte anglais (lent, adapté aux enfants). */
  async speak(text: string): Promise<void> {
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
          rate: 0.9,
          pitch: 1.1,
          volume: 1.0,
          category: 'ambient',
        });
      } catch (e) {
        console.warn('TTS natif indisponible', e);
      }
      return;
    }
    this.speakWeb(text);
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

  private speakWeb(text: string): void {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.9;
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
