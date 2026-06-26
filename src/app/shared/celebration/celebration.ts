import { Component, output, signal } from '@angular/core';
import confetti from 'canvas-confetti';

const PRAISE = ['Bravo !', 'Super !', 'Great!', 'Yes!', 'Génial !', 'Yeah!'];

/** Options de célébration. */
export interface CelebrateOptions {
  /** Icône affichée (⭐ par défaut, 🏆 pour un grand test gagné). */
  icon?: string;
  /** Message affiché (sinon un encouragement aléatoire). */
  message?: string;
  /** Joue une petite fanfare de victoire (Web Audio, hors-ligne). */
  sound?: boolean;
}

/**
 * Overlay de célébration : confettis + gros message animé (+ fanfare optionnelle).
 * Le parent appelle `play()` après une bonne réponse ; `done` est émis à la fin.
 */
@Component({
  selector: 'app-celebration',
  template: `
    @if (visible()) {
      <div class="celebrate" (click)="$event.stopPropagation()">
        <div class="burst anim-pop">
          <div class="icon">{{ icon() }}</div>
          <div class="msg">{{ message() }}</div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .celebrate {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        background: rgba(43, 45, 66, 0.35);
        pointer-events: none;
      }
      .burst {
        text-align: center;
      }
      .icon {
        font-size: 5rem;
        animation: bounce 0.6s ease;
      }
      .msg {
        margin-top: 8px;
        font-size: 3rem;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 4px 0 rgba(43, 45, 66, 0.4);
      }
    `,
  ],
})
export class Celebration {
  readonly done = output<void>();
  readonly visible = signal(false);
  readonly message = signal(PRAISE[0]);
  readonly icon = signal('⭐');

  private timer: ReturnType<typeof setTimeout> | null = null;

  play(opts?: CelebrateOptions): void {
    this.icon.set(opts?.icon ?? '⭐');
    this.message.set(opts?.message ?? PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    this.visible.set(true);
    this.fireConfetti(!!opts?.sound);
    if (opts?.sound) {
      this.playFanfare();
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(
      () => {
        this.visible.set(false);
        this.done.emit();
      },
      opts?.sound ? 2400 : 1300,
    );
  }

  private fireConfetti(big: boolean): void {
    const base = { spread: 70, startVelocity: 45, ticks: 120, zIndex: 60 };
    confetti({ ...base, particleCount: big ? 140 : 80, origin: { x: 0.5, y: 0.7 } });
    confetti({ ...base, particleCount: 50, angle: 60, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 50, angle: 120, origin: { x: 1, y: 0.8 } });
    if (big) {
      setTimeout(() => {
        confetti({ ...base, particleCount: 80, origin: { x: 0.5, y: 0.6 } });
      }, 350);
    }
  }

  /** Petite fanfare ascendante synthétisée (aucun fichier audio, fonctionne hors-ligne). */
  private playFanfare(): void {
    try {
      const Ctx =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // do – mi – sol – do (octave)
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + i * 0.16;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
      setTimeout(() => ctx.close?.(), 1800);
    } catch {
      /* audio indisponible : on ignore */
    }
  }
}
