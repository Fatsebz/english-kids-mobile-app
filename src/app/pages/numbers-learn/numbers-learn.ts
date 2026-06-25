import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { NUMBERS, NumberItem } from '../../data/numbers.data';
import { PlayButtons } from '../../shared/play-buttons/play-buttons';

@Component({
  selector: 'app-numbers-learn',
  imports: [RouterLink, PlayButtons],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">Numbers</h1>
        <span class="btn-round" aria-hidden="true">📚</span>
      </div>

      <app-play-buttons themeId="numbers" />

      <div class="stage card" (click)="say(current())">
        <div class="digit anim-pop" [attr.key]="current().value">{{ current().value }}</div>
        <div class="word">{{ current().word }}</div>
        <button class="btn-round speak" (click)="say(current()); $event.stopPropagation()" aria-label="Écouter">
          🔊
        </button>
      </div>

      <div class="grid">
        @for (n of numbers; track n.value) {
          <button
            class="ntile"
            [class.active]="n.value === current().value"
            (click)="select(n)"
          >
            {{ n.value }}
          </button>
        }
      </div>
    </main>
  `,
  styles: [
    `
      .stage {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        min-height: 34vh;
      }
      .digit {
        font-size: clamp(5rem, 28vw, 9rem);
        font-weight: 700;
        line-height: 1;
        color: var(--c-primary);
      }
      .word {
        font-size: clamp(1.8rem, 9vw, 2.6rem);
        font-weight: 600;
        text-transform: capitalize;
        margin-top: 6px;
      }
      .speak {
        position: absolute;
        right: 14px;
        bottom: 14px;
      }
      .ntile {
        border: none;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.92);
        color: var(--c-text);
        font-family: inherit;
        font-weight: 700;
        font-size: 1.5rem;
        aspect-ratio: 1;
        cursor: pointer;
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
        transition: transform 0.08s ease, box-shadow 0.08s ease;
      }
      .ntile:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.16);
      }
      .ntile.active {
        background: var(--c-accent);
        box-shadow: 0 4px 0 #c9a200;
      }
    `,
  ],
})
export class NumbersLearn {
  private readonly audio = inject(AudioService);
  readonly numbers = NUMBERS;
  readonly current = signal<NumberItem>(NUMBERS[0]);

  select(n: NumberItem): void {
    this.current.set(n);
    this.say(n);
  }

  say(n: NumberItem): void {
    this.audio.speak(n.word);
  }
}
