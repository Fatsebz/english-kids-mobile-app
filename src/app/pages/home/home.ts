import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { THEMES } from '../../data/themes';
import { ProgressService } from '../../core/progress.service';
import { ProfileService } from '../../core/profile.service';
import { SettingsService } from '../../core/settings.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main class="screen home">
      <h1 class="title big">English Kids</h1>
      <p class="subtitle">Apprends l'anglais en jouant&nbsp;!</p>

      <div class="tiles">
        @for (t of themes(); track t.id) {
          <a class="tile anim-pop" [routerLink]="t.learnPath" [style.background]="t.gradient">
            <span class="badge">
              @if (progress.isChampion(t.id)) {
                <span class="trophy" aria-label="Grand test réussi">🏆</span>
              } @else {
                @for (s of [1, 2, 3]; track s) {
                  <span class="star" [class.earned]="progress.stars(t.id, t.items.length) >= s">★</span>
                }
              }
            </span>
            <span class="emoji">{{ t.tileEmoji }}</span>
            <span class="label">{{ t.title }}</span>
            <span class="hint">{{ t.fr }}</span>
          </a>
        }
      </div>
    </main>
  `,
  styles: [
    `
      .home {
        overflow-y: auto;
      }
      .big {
        font-size: clamp(2.2rem, 11vw, 3.4rem);
        text-align: center;
      }
      .subtitle {
        text-align: center;
      }
      .tiles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-top: 14px;
      }
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
      }
    `,
  ],
})
export class Home {
  protected readonly progress = inject(ProgressService);
  private readonly profiles = inject(ProfileService);
  private readonly settings = inject(SettingsService);

  readonly themes = computed(() => {
    const id = this.profiles.current()?.id;
    if (!id) return THEMES;
    const modes = this.settings.modesFor(id);
    return THEMES.filter((t) => {
      if (!this.settings.isThemeEnabled(id, t.id)) return false;
      // Au moins un mode utilisable : « lecture » marche partout, « écoute » seulement si supporté.
      return modes.some((m) => m === 'read' || t.listen);
    });
  });
}
