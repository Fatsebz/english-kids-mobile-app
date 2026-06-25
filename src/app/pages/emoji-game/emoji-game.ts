import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { EmojiItem } from '../../data/emoji-item';
import { findModule } from '../../data/modules';
import { buildQuestion, Question } from '../../shared/quiz-engine';
import { Celebration } from '../../shared/celebration/celebration';

@Component({
  selector: 'app-emoji-game',
  imports: [RouterLink, Celebration],
  template: `
    @if (question(); as q) {
      <main class="screen">
        <div class="topbar">
          <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
          <h1 class="title">Quiz</h1>
          <a class="btn-round" [routerLink]="['/m', id]" aria-label="Apprendre">📖</a>
        </div>

        <p class="subtitle">Qu'est-ce que c'est en anglais&nbsp;? ⭐ {{ score() }}</p>

        <div class="prompt card">
          <div class="pic anim-pop" [attr.data-k]="q.answer.word">
            {{ q.answer.emoji }}
          </div>
        </div>

        <div class="choices">
          @for (c of q.choices; track c.word) {
            <button
              class="btn choice"
              [class.anim-shake]="wrong() === c.word"
              (click)="answer(c)"
            >
              {{ c.word }}
            </button>
          }
        </div>

        <app-celebration (done)="next()" />
      </main>
    }
  `,
  styles: [
    `
      .prompt {
        display: grid;
        place-items: center;
        min-height: 30vh;
      }
      .pic {
        font-size: clamp(6rem, 38vw, 11rem);
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
export class EmojiGame {
  private readonly audio = inject(AudioService);
  private readonly router = inject(Router);
  private readonly celeb = viewChild(Celebration);

  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly items: EmojiItem[];

  readonly question = signal<Question<EmojiItem>>(null!);
  readonly score = signal(0);
  readonly wrong = signal<string | null>(null);
  private locked = false;

  constructor() {
    const module = findModule(this.id);
    if (!module) {
      this.items = [];
      this.router.navigateByUrl('/');
      return;
    }
    this.items = module.items;
    this.question.set(buildQuestion(this.items));
  }

  answer(c: EmojiItem): void {
    if (this.locked) return;

    if (c.word === this.question().answer.word) {
      this.locked = true;
      this.audio.speak(c.word);
      this.score.update((s) => s + 1);
      this.celeb()?.play();
    } else {
      this.wrong.set(c.word);
      setTimeout(() => this.wrong.set(null), 450);
    }
  }

  next(): void {
    this.question.set(buildQuestion(this.items, 4, this.question().answer));
    this.locked = false;
  }
}
