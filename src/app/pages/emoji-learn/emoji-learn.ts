import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AudioService } from '../../core/audio.service';
import { EmojiItem } from '../../data/emoji-item';
import { findModule } from '../../data/modules';
import { PlayButtons } from '../../shared/play-buttons/play-buttons';

@Component({
  selector: 'app-emoji-learn',
  imports: [RouterLink, PlayButtons],
  template: `
    @if (current(); as cur) {
      <main class="screen">
        <div class="topbar">
          <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
          <h1 class="title">{{ title }}</h1>
          <span class="btn-round" aria-hidden="true">📚</span>
        </div>

        <app-play-buttons [themeId]="id ?? ''" />

        <div class="stage card" (click)="say(cur)">
          <div class="pic anim-pop" [attr.key]="cur.word">{{ cur.emoji }}</div>
          <div class="name">{{ cur.word }}</div>
          <div class="fr">{{ cur.fr }}</div>
          <button class="btn-round speak" (click)="say(cur); $event.stopPropagation()" aria-label="Écouter">
            🔊
          </button>
        </div>

        <div class="grid emojis">
          @for (it of items; track it.word) {
            <button
              class="etile"
              [class.active]="it.word === cur.word"
              (click)="select(it)"
              [attr.aria-label]="it.word"
            >
              {{ it.emoji }}
            </button>
          }
        </div>
      </main>
    }
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
      .pic {
        font-size: clamp(5rem, 28vw, 8.5rem);
        line-height: 1;
      }
      .name {
        font-size: clamp(2rem, 10vw, 2.8rem);
        font-weight: 700;
        text-transform: capitalize;
        margin-top: 8px;
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
      .emojis {
        grid-template-columns: repeat(4, 1fr);
      }
      .etile {
        border: none;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.92);
        font-family: inherit;
        font-size: clamp(1.8rem, 9vw, 2.4rem);
        aspect-ratio: 1;
        cursor: pointer;
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
        transition: transform 0.08s ease, box-shadow 0.08s ease;
      }
      .etile:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.16);
      }
      .etile.active {
        background: var(--c-accent);
        box-shadow: 0 4px 0 #c9a200;
      }
    `,
  ],
})
export class EmojiLearn {
  private readonly audio = inject(AudioService);
  private readonly router = inject(Router);

  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly module = findModule(this.id);

  readonly title = this.module?.title ?? '';
  readonly items = this.module?.items ?? [];
  readonly current = signal<EmojiItem>(this.items[0]);

  constructor() {
    if (!this.module) {
      this.router.navigateByUrl('/');
    }
  }

  select(it: EmojiItem): void {
    this.current.set(it);
    this.say(it);
  }

  say(it: EmojiItem): void {
    this.audio.speak(it.word);
  }
}
