import { Component, inject, input } from '@angular/core';
import { AudioService } from '../../core/audio.service';

/**
 * Deux boutons de prononciation en bas de la « scène » d'apprentissage :
 * - à gauche, fond drapeau **français** → lit le mot en français (`fr`),
 * - à droite, fond **union jack** → lit le mot en anglais (`en`).
 * À placer dans un conteneur `position: relative` (la `.stage`).
 */
@Component({
  selector: 'app-say-flags',
  template: `
    <button
      class="flag-btn fr"
      (click)="sayFr(); $event.stopPropagation()"
      aria-label="Écouter en français"
    >
      <span class="ico">🔊</span>
    </button>
    <button
      class="flag-btn uk"
      (click)="sayEn(); $event.stopPropagation()"
      aria-label="Écouter en anglais"
    >
      <span class="ico">🔊</span>
    </button>
  `,
  styles: [
    `
      .flag-btn {
        position: absolute;
        bottom: 14px;
        width: 58px;
        height: 58px;
        border: 3px solid #fff;
        border-radius: 50%;
        cursor: pointer;
        display: grid;
        place-items: center;
        padding: 0;
        box-shadow: 0 4px 10px var(--c-shadow);
        transition: transform 0.08s ease;
      }
      .flag-btn:active {
        transform: scale(0.92);
      }
      .ico {
        font-size: 1.5rem;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
      }
      .fr {
        left: 14px;
        background: linear-gradient(90deg, #0055a4 0 33.3%, #fff 33.3% 66.6%, #ef4135 66.6% 100%);
      }
      .uk {
        right: 14px;
        background:
          linear-gradient(0deg, transparent 42%, #cf142b 42% 58%, transparent 58%),
          linear-gradient(90deg, transparent 42%, #cf142b 42% 58%, transparent 58%),
          linear-gradient(0deg, transparent 34%, #fff 34% 66%, transparent 66%),
          linear-gradient(90deg, transparent 34%, #fff 34% 66%, transparent 66%),
          #00247d;
      }
    `,
  ],
})
export class SayFlags {
  private readonly audio = inject(AudioService);

  /** Mot anglais (bouton union jack). */
  readonly en = input.required<string>();
  /** Mot français (bouton drapeau FR). */
  readonly fr = input.required<string>();

  sayEn(): void {
    this.audio.speak(this.en());
  }
  sayFr(): void {
    this.audio.speakFr(this.fr());
  }
}
