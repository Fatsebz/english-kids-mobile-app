import { Component, inject, signal } from '@angular/core';
import { AudioService } from '../../core/audio.service';

/**
 * Bannière d'alerte si la voix anglaise est indisponible (sinon l'app paraît « muette »).
 * Affichée en bas, refermable.
 */
@Component({
  selector: 'app-audio-warning',
  template: `
    @if (audio.unavailable() && !dismissed()) {
      <div class="audio-warning">
        <span class="txt">
          🔇 La voix anglaise n'est pas installée : la prononciation sera muette.
          Installe-la dans <b>Réglages Android → Synthèse vocale</b>.
        </span>
        <button class="close" (click)="dismissed.set(true)" aria-label="Fermer">✕</button>
      </div>
    }
  `,
  styles: [
    `
      .audio-warning {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 45;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
        background: #c92a2a;
        color: #fff;
        font-size: 0.95rem;
        box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.3);
      }
      .txt {
        flex: 1;
      }
      .close {
        flex: 0 0 auto;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1.1rem;
        cursor: pointer;
      }
    `,
  ],
})
export class AudioWarning {
  protected readonly audio = inject(AudioService);
  readonly dismissed = signal(false);
}
