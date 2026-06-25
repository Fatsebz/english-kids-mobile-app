import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { COLORS, ColorItem } from '../../data/colors.data';

@Component({
  selector: 'app-colors-learn',
  imports: [RouterLink],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">Colors</h1>
        <a class="btn-round" routerLink="/colors/play" aria-label="Jouer">▶️</a>
      </div>

      <div class="stage card" (click)="say(current())">
        <div
          class="swatch anim-pop"
          [class.bordered]="current().light"
          [style.background]="current().hex"
        ></div>
        <div class="name">{{ current().name }}</div>
        <div class="fr">{{ current().fr }}</div>
        <button class="btn-round speak" (click)="say(current()); $event.stopPropagation()" aria-label="Écouter">
          🔊
        </button>
      </div>

      <div class="grid colors">
        @for (c of colors; track c.name) {
          <button
            class="dot"
            [class.bordered]="c.light"
            [class.active]="c.name === current().name"
            [style.background]="c.hex"
            (click)="select(c)"
            [attr.aria-label]="c.name"
          ></button>
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
        padding: 18px;
        min-height: 34vh;
      }
      .swatch {
        width: clamp(120px, 40vw, 190px);
        height: clamp(120px, 40vw, 190px);
        border-radius: 50%;
        box-shadow: 0 8px 18px var(--c-shadow);
      }
      .bordered {
        border: 3px solid #d9dce1;
      }
      .name {
        font-size: clamp(2rem, 10vw, 2.8rem);
        font-weight: 700;
        text-transform: capitalize;
        margin-top: 12px;
      }
      .fr {
        font-size: 1.1rem;
        opacity: 0.6;
        text-transform: capitalize;
      }
      .speak {
        position: absolute;
        right: 14px;
        bottom: 14px;
      }
      .colors {
        grid-template-columns: repeat(4, 1fr);
      }
      .dot {
        aspect-ratio: 1;
        border: 3px solid transparent;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
        transition: transform 0.08s ease;
      }
      .dot:active {
        transform: scale(0.92);
      }
      .dot.active {
        border-color: #fff;
        outline: 3px solid var(--c-accent);
      }
      .dot.bordered {
        border-color: #d9dce1;
      }
      .dot.bordered.active {
        outline: 3px solid var(--c-accent);
      }
    `,
  ],
})
export class ColorsLearn {
  private readonly audio = inject(AudioService);
  readonly colors = COLORS;
  readonly current = signal<ColorItem>(COLORS[0]);

  select(c: ColorItem): void {
    this.current.set(c);
    this.say(c);
  }

  say(c: ColorItem): void {
    this.audio.speak(c.name);
  }
}
