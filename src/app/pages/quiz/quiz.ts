import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { ProgressService } from '../../core/progress.service';
import { findTheme, ThemeEntry } from '../../data/themes';
import { choicesFor, pickTarget } from '../../shared/quiz-engine';
import { Celebration } from '../../shared/celebration/celebration';

type Mode = 'read' | 'listen';

@Component({
  selector: 'app-quiz',
  imports: [RouterLink, Celebration],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">{{ title }}</h1>
        <a class="btn-round" [routerLink]="learnPath" aria-label="Apprendre">📖</a>
      </div>

      <p class="subtitle">
        @if (mode === 'listen') { Écoute et choisis la bonne image&nbsp;! } @else { Trouve le bon mot&nbsp;! }
        ⭐ {{ score() }}
      </p>

      @if (target(); as t) {
        @if (mode === 'listen') {
          <div class="prompt card listen" (click)="say(t)">
            <button class="speaker" (click)="say(t); $event.stopPropagation()" aria-label="Réécouter">🔊</button>
            <span class="tap-hint">Touche pour réécouter</span>
          </div>

          <div class="choices images">
            @for (c of choices(); track c.key) {
              <button class="img-choice" [class.anim-shake]="wrong() === c.key" (click)="answer(c)">
                @switch (kind) {
                  @case ('number') { <span class="digit">{{ c.display }}</span> }
                  @case ('color') {
                    <span class="swatch" [class.bordered]="c.light" [style.background]="c.display"></span>
                  }
                  @default { <span class="pic">{{ c.display }}</span> }
                }
              </button>
            }
          </div>
        } @else {
          <div class="prompt card">
            @switch (kind) {
              @case ('number') { <div class="digit anim-pop">{{ t.display }}</div> }
              @case ('color') {
                <div class="swatch big anim-pop" [class.bordered]="t.light" [style.background]="t.display"></div>
              }
              @default { <div class="pic anim-pop">{{ t.display }}</div> }
            }
          </div>

          <div class="choices">
            @for (c of choices(); track c.key) {
              <button class="btn choice" [class.anim-shake]="wrong() === c.key" (click)="answer(c)">
                {{ c.label }}
              </button>
            }
          </div>
        }
      }

      <app-celebration (done)="next()" />
    </main>
  `,
  styles: [
    `
      .prompt {
        display: grid;
        place-items: center;
        min-height: 28vh;
        position: relative;
      }
      .prompt.listen {
        flex-direction: column;
        gap: 8px;
        cursor: pointer;
      }
      .speaker {
        border: none;
        background: var(--c-blue);
        color: #fff;
        width: clamp(110px, 34vw, 150px);
        height: clamp(110px, 34vw, 150px);
        border-radius: 50%;
        font-size: clamp(3rem, 14vw, 4.5rem);
        box-shadow: 0 8px 0 #2f8ad1;
        cursor: pointer;
      }
      .speaker:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 #2f8ad1;
      }
      .tap-hint {
        font-size: 0.95rem;
        opacity: 0.55;
      }
      .digit {
        font-size: clamp(5rem, 30vw, 10rem);
        font-weight: 700;
        color: var(--c-blue);
        line-height: 1;
      }
      .pic {
        font-size: clamp(5rem, 30vw, 9rem);
        line-height: 1;
      }
      .swatch {
        width: clamp(58px, 20vw, 90px);
        height: clamp(58px, 20vw, 90px);
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 6px 14px var(--c-shadow);
      }
      .swatch.big {
        width: clamp(130px, 44vw, 200px);
        height: clamp(130px, 44vw, 200px);
      }
      .swatch.bordered {
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
      .choices.images .img-choice {
        border: none;
        border-radius: var(--radius);
        background: rgba(255, 255, 255, 0.95);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 5px 0 rgba(0, 0, 0, 0.16);
        transition: transform 0.08s ease, box-shadow 0.08s ease;
      }
      .choices.images .img-choice:active {
        transform: translateY(3px);
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.16);
      }
      .choices.images .digit {
        font-size: clamp(3rem, 16vw, 5rem);
      }
      .choices.images .pic {
        font-size: clamp(3rem, 16vw, 5rem);
      }
    `,
  ],
})
export class Quiz {
  private readonly audio = inject(AudioService);
  private readonly progress = inject(ProgressService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly celeb = viewChild(Celebration);

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly mode: Mode = this.route.snapshot.paramMap.get('mode') === 'listen' ? 'listen' : 'read';
  private readonly theme = findTheme(this.id);

  readonly title = this.theme?.title ?? '';
  readonly kind = this.theme?.kind ?? 'emoji';
  readonly learnPath = this.theme?.learnPath ?? '/';

  readonly target = signal<ThemeEntry | null>(null);
  readonly choices = signal<ThemeEntry[]>([]);
  readonly score = signal(0);
  readonly wrong = signal<string | null>(null);

  private readonly seen = new Set<string>();
  private locked = false;

  constructor() {
    // Thème invalide, ou mode « écoute » demandé sur un thème non écoutable → retour accueil.
    if (!this.theme || (this.mode === 'listen' && !this.theme.listen)) {
      this.router.navigateByUrl('/');
      return;
    }
    this.nextQuestion();
  }

  say(t: ThemeEntry): void {
    this.audio.speak(t.label);
  }

  answer(c: ThemeEntry): void {
    if (this.locked) return;
    const t = this.target();
    if (!t) return;

    if (c.key === t.key) {
      this.locked = true;
      this.audio.speak(c.label);
      this.progress.recordCorrect(this.id, c.key);
      this.score.update((s) => s + 1);
      this.celeb()?.play();
    } else {
      this.wrong.set(c.key);
      setTimeout(() => this.wrong.set(null), 450);
    }
  }

  /** Appelé à la fin de la célébration : question suivante. */
  next(): void {
    this.locked = false;
    this.nextQuestion();
  }

  private nextQuestion(): void {
    const items = this.theme!.items;
    const keyOf = (e: ThemeEntry) => e.key;
    const prev = this.target()?.key;
    const t = pickTarget(items, keyOf, this.progress.masteredSet(this.id), this.seen, prev);
    this.seen.add(t.key);
    this.target.set(t);
    this.choices.set(choicesFor(items, t, keyOf));
    if (this.mode === 'listen') {
      // Prononce automatiquement le mot à deviner.
      this.audio.speak(t.label);
    }
  }
}
