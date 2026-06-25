import { Component, output, signal } from '@angular/core';
import confetti from 'canvas-confetti';

const PRAISE = ['Bravo !', 'Super !', 'Great!', 'Yes!', 'Génial !', 'Yeah!'];

/**
 * Overlay de célébration : confettis + gros message animé.
 * Le parent appelle `play()` après une bonne réponse ; `done` est émis à la fin.
 */
@Component({
  selector: 'app-celebration',
  template: `
    @if (visible()) {
      <div class="celebrate" (click)="$event.stopPropagation()">
        <div class="burst anim-pop">
          <div class="star">⭐</div>
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
      .star {
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

  private timer: ReturnType<typeof setTimeout> | null = null;

  play(): void {
    this.message.set(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    this.visible.set(true);
    this.fireConfetti();

    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.visible.set(false);
      this.done.emit();
    }, 1300);
  }

  private fireConfetti(): void {
    const base = { spread: 70, startVelocity: 45, ticks: 120, zIndex: 60 };
    confetti({ ...base, particleCount: 80, origin: { x: 0.5, y: 0.7 } });
    confetti({ ...base, particleCount: 40, angle: 60, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 40, angle: 120, origin: { x: 1, y: 0.8 } });
  }
}
