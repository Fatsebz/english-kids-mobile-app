import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { NUMBERS, NumberItem } from '../../data/numbers.data';
import { buildQuestion, Question } from '../../shared/quiz-engine';
import { Celebration } from '../../shared/celebration/celebration';

@Component({
  selector: 'app-numbers-game',
  imports: [RouterLink, Celebration],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">Quiz</h1>
        <a class="btn-round" routerLink="/numbers" aria-label="Apprendre">📖</a>
      </div>

      <p class="subtitle">Quel est ce nombre en anglais&nbsp;? ⭐ {{ score() }}</p>

      <div class="prompt card">
        <div class="digit anim-pop" [attr.data-k]="question().answer.value">
          {{ question().answer.value }}
        </div>
      </div>

      <div class="choices">
        @for (c of question().choices; track c.value) {
          <button
            class="btn choice"
            [class.btn--green]="false"
            [class.anim-shake]="wrong() === c.value"
            (click)="answer(c)"
          >
            {{ c.word }}
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
        margin-bottom: 4px;
      }
      .digit {
        font-size: clamp(6rem, 36vw, 11rem);
        font-weight: 700;
        color: var(--c-blue);
        line-height: 1;
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
export class NumbersGame {
  private readonly audio = inject(AudioService);
  private readonly celeb = viewChild(Celebration);

  readonly question = signal<Question<NumberItem>>(buildQuestion(NUMBERS));
  readonly score = signal(0);
  readonly wrong = signal<number | null>(null);
  private locked = false;

  answer(c: NumberItem): void {
    if (this.locked) return;

    if (c.value === this.question().answer.value) {
      this.locked = true;
      this.audio.speak(c.word);
      this.score.update((s) => s + 1);
      this.celeb()?.play();
    } else {
      this.wrong.set(c.value);
      setTimeout(() => this.wrong.set(null), 450);
    }
  }

  next(): void {
    this.question.set(buildQuestion(NUMBERS, 4, this.question().answer));
    this.locked = false;
  }
}
