import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { ProgressService } from '../../core/progress.service';
import { findTheme, ThemeEntry } from '../../data/themes';
import { choicesFor, shuffle } from '../../shared/quiz-engine';
import { Celebration } from '../../shared/celebration/celebration';

type Mode = 'read' | 'listen';

@Component({
  selector: 'app-grand-test',
  imports: [RouterLink, Celebration],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">🏆 {{ title }}</h1>
        <span class="btn-round counter">{{ index() + 1 }}/{{ total }}</span>
      </div>

      <p class="subtitle">
        @if (failed()) {
          Oups&nbsp;! On recommence depuis le début 🙂
        } @else if (mode === 'listen') {
          Écoute et choisis la bonne image, sans erreur&nbsp;!
        } @else {
          Trouve le bon mot, sans erreur&nbsp;!
        }
      </p>

      <div class="progress">
        @for (e of seq(); track $index; let i = $index) {
          <span class="pip" [class.done]="i < index()"></span>
        }
      </div>

      @if (current(); as cur) {
        @if (mode === 'listen') {
          <div class="prompt card listen" (click)="say(cur)">
            <button class="speaker" (click)="say(cur); $event.stopPropagation()" aria-label="Réécouter">🔊</button>
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
              @case ('number') { <div class="digit anim-pop" [attr.data-k]="cur.key">{{ cur.display }}</div> }
              @case ('color') {
                <div class="swatch big anim-pop" [class.bordered]="cur.light" [style.background]="cur.display" [attr.data-k]="cur.key"></div>
              }
              @default { <div class="pic anim-pop" [attr.data-k]="cur.key">{{ cur.display }}</div> }
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

      <app-celebration (done)="finish()" />
    </main>
  `,
  styles: [
    `
      .counter {
        font-size: 1rem;
        font-weight: 700;
        color: var(--c-text);
      }
      .progress {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
      }
      .pip {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.45);
      }
      .pip.done {
        background: var(--c-accent);
      }
      .prompt {
        display: grid;
        place-items: center;
        min-height: 28vh;
      }
      .prompt.listen {
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
export class GrandTest {
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
  readonly total = this.theme?.items.length ?? 0;

  readonly seq = signal<ThemeEntry[]>([]);
  readonly index = signal(0);
  readonly wrong = signal<string | null>(null);
  readonly failed = signal(false);
  readonly current = computed(() => this.seq()[this.index()]);
  readonly choices = signal<ThemeEntry[]>([]);

  private locked = false;
  private won = false;

  constructor() {
    // Accès réservé : thème valide et 3 étoiles obtenues.
    if (!this.theme || this.progress.stars(this.id, this.total) < 3) {
      this.router.navigateByUrl('/');
      return;
    }
    this.restart();
  }

  say(t: ThemeEntry): void {
    this.audio.speak(t.label);
  }

  answer(c: ThemeEntry): void {
    if (this.locked) return;

    if (c.key === this.current().key) {
      this.audio.speak(c.label);
      const next = this.index() + 1;
      if (next >= this.total) {
        this.locked = true;
        this.won = true;
        this.progress.setChampion(this.id);
        this.celeb()?.play();
      } else {
        this.goTo(next);
      }
    } else {
      this.wrong.set(c.key);
      this.failed.set(true);
      this.locked = true;
      setTimeout(() => {
        this.wrong.set(null);
        this.locked = false;
        this.restart();
      }, 700);
    }
  }

  /** Appelé à la fin de la célébration de victoire. */
  finish(): void {
    if (this.won) {
      this.router.navigateByUrl('/');
    }
  }

  private restart(): void {
    this.seq.set(shuffle(this.theme!.items));
    this.goTo(0);
  }

  private goTo(index: number): void {
    this.index.set(index);
    const target = this.current();
    this.choices.set(choicesFor(this.theme!.items, target, (e) => e.key));
    if (this.mode === 'listen') {
      this.audio.speak(target.label);
    }
  }
}
