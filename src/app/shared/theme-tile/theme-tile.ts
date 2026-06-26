import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Theme } from '../../data/themes';
import { ProgressService } from '../../core/progress.service';

/** Tuile d'un thème : visuel + titre + étoiles (ou coupe si grand test réussi). */
@Component({
  selector: 'app-theme-tile',
  imports: [RouterLink],
  template: `
    <a class="tile anim-pop" [routerLink]="theme().learnPath" [style.background]="theme().gradient">
      <span class="badge">
        @if (progress.isChampion(theme().id)) {
          <span class="trophy" aria-label="Grand test réussi">🏆</span>
        } @else {
          @for (s of [1, 2, 3]; track s) {
            <span class="star" [class.earned]="progress.stars(theme().id, theme().items.length) >= s">★</span>
          }
        }
      </span>
      <span class="emoji">{{ theme().tileEmoji }}</span>
      <span class="label">{{ theme().title }}</span>
      <span class="hint">{{ theme().fr }}</span>
    </a>
  `,
  styles: [
    `
      .tile {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        text-decoration: none;
        color: #fff;
        border-radius: var(--radius);
        padding: 26px 12px 18px;
        box-shadow: 0 8px 0 rgba(0, 0, 0, 0.18);
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      .tile:active {
        transform: translateY(5px);
        box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
      }
      .badge {
        position: absolute;
        top: 8px;
        right: 10px;
        display: flex;
        gap: 1px;
        font-size: 0.95rem;
        line-height: 1;
      }
      .star {
        color: rgba(0, 0, 0, 0.28);
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
      }
      .star.earned {
        color: var(--c-accent);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      }
      .trophy {
        font-size: 1.4rem;
      }
      .emoji {
        font-size: 3.2rem;
      }
      .label {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .hint {
        font-size: 0.95rem;
        opacity: 0.95;
        text-align: center;
      }
    `,
  ],
})
export class ThemeTile {
  protected readonly progress = inject(ProgressService);
  readonly theme = input.required<Theme>();
}
