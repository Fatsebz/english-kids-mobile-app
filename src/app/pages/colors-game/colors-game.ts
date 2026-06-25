import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { COLORS, ColorItem } from '../../data/colors.data';
import { buildQuestion, Question } from '../../shared/quiz-engine';
import { Celebration } from '../../shared/celebration/celebration';

@Component({
  selector: 'app-colors-game',
  imports: [RouterLink, Celebration],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">Quiz</h1>
        <a class="btn-round" routerLink="/colors" aria-label="Apprendre">📖</a>
      </div>

      <p class="subtitle">Quelle est cette couleur en anglais&nbsp;? ⭐ {{ score() }}</p>

      <div class="prompt card">
        <div
          class="swatch anim-pop"
          [class.bordered]="question().answer.light"
          [style.background]="question().answer.hex"
          [attr.data-k]="question().answer.name"
        ></div>
      </div>

      <div class="choices">
        @for (c of question().choices; track c.name) {
          <button
            class="btn choice"
            [class.anim-shake]="wrong() === c.name"
            (click)="answer(c)"
          >
            {{ c.name }}
          </button>
        }
      </div>

      <app-celebration (done)="next()" />
    </main>
  `,
  styles: [
    `
      .prompt {
        display: grid;
        place-items: center;
        min-height: 30vh;
      }
      .swatch {
        width: clamp(130px, 44vw, 200px);
        height: clamp(130px, 44vw, 200px);
        border-radius: 50%;
        box-shadow: 0 8px 18px var(--c-shadow);
      }
      .bordered {
        border: 3px solid #d9dce1;
      }
      .choices {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .choice {
        text-transform: capitalize;
      }
    `,
  ],
})
export class ColorsGame {
  private readonly audio = inject(AudioService);
  private readonly celeb = viewChild(Celebration);

  readonly question = signal<Question<ColorItem>>(buildQuestion(COLORS));
  readonly score = signal(0);
  readonly wrong = signal<string | null>(null);
  private locked = false;

  answer(c: ColorItem): void {
    if (this.locked) return;

    if (c.name === this.question().answer.name) {
      this.locked = true;
      this.audio.speak(c.name);
      this.score.update((s) => s + 1);
      this.celeb()?.play();
    } else {
      this.wrong.set(c.name);
      setTimeout(() => this.wrong.set(null), 450);
    }
  }

  next(): void {
    this.question.set(buildQuestion(COLORS, 4, this.question().answer));
    this.locked = false;
  }
}
