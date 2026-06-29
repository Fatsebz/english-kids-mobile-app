import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Theme, THEMES } from '../../data/themes';
import { GROUPED_THEME_IDS, GROUPS } from '../../data/groups';
import { ALL_ID, CHAMPIONS_ID } from '../../data/aggregate';
import { SettingsService } from '../../core/settings.service';
import { ProgressService } from '../../core/progress.service';
import { AudioService } from '../../core/audio.service';
import { AggregateService } from '../../core/aggregate.service';
import { ThemeTile } from '../../shared/theme-tile/theme-tile';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ThemeTile],
  template: `
    <main class="screen home">
      <img class="logo" src="englishkidz.webp" alt="English Kidz" />
      <p class="subtitle">Apprends l'anglais en jouant&nbsp;!</p>

      <div class="tiles">
        @for (r of reviewTiles(); track r.id) {
          <a class="tile group review anim-pop" [routerLink]="['/review', r.id]" [style.background]="r.gradient" (click)="say(r.title)">
            <span class="emoji">{{ r.tileEmoji }}</span>
            <span class="label">{{ r.title }}</span>
            <span class="hint">{{ r.fr }}</span>
          </a>
        }
        @for (g of groups(); track g.id) {
          <a class="tile group anim-pop" [routerLink]="['/g', g.id]" [style.background]="g.gradient" (click)="say(g.title)">
            @if (groupChampion(g)) {
              <span class="badge"><span class="trophy" aria-label="Groupe terminé">🏆</span></span>
            }
            <span class="mini-grid">
              @for (t of groupPreview(g); track t.id) {
                <span class="mini" [style.background]="t.gradient">{{ t.tileEmoji }}</span>
              }
            </span>
            <span class="label">{{ g.title }}</span>
            <span class="hint">{{ g.fr }}</span>
          </a>
        }
        @for (t of standalone(); track t.id) {
          <app-theme-tile [theme]="t" />
        }
      </div>
    </main>
  `,
  styles: [
    `
      .home {
        overflow-y: auto;
      }
      .logo {
        display: block;
        width: clamp(180px, 60vw, 280px);
        height: auto;
        margin: 0 auto;
        filter: drop-shadow(0 4px 10px var(--c-shadow));
      }
      .subtitle {
        text-align: center;
        margin-top: -24px;
      }
      .tiles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-top: 14px;
      }
      .tile.group {
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
      .tile.group:active {
        transform: translateY(5px);
        box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
      }
      .mini-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        width: 74px;
        margin-bottom: 6px;
      }
      .mini {
        aspect-ratio: 1;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
      }
      .tile.review .emoji {
        font-size: 3.2rem;
      }
      .tile.group .label {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .tile.group .hint {
        font-size: 0.95rem;
        opacity: 0.95;
        text-align: center;
      }
      .tile.group .badge {
        position: absolute;
        top: 8px;
        right: 10px;
      }
      .tile.group .trophy {
        font-size: 1.4rem;
      }
    `,
  ],
})
export class Home {
  private readonly settings = inject(SettingsService);
  private readonly progress = inject(ProgressService);
  private readonly audio = inject(AudioService);
  private readonly agg = inject(AggregateService);

  /** Tuiles de révision dynamiques (Tout / Champions) quand pertinentes. */
  readonly reviewTiles = computed(() =>
    [ALL_ID, CHAMPIONS_ID]
      .filter((id) => this.agg.visible(id))
      .map((id) => this.agg.meta(id))
      .filter((t): t is Theme => !!t),
  );

  say(title: string): void {
    this.audio.speak(title);
  }

  /** Un thème est visible s'il est activé, compatible avec le profil (lecture) et qu'un mode est dispo. */
  private visible(t: Theme): boolean {
    return this.settings.isThemeVisibleForCurrent(t);
  }

  /** Thèmes hors groupe, visibles. */
  readonly standalone = computed(() =>
    THEMES.filter((t) => !GROUPED_THEME_IDS.has(t.id) && this.visible(t)),
  );

  private visibleThemesOf(themeIds: string[]): Theme[] {
    return themeIds
      .map((tid) => THEMES.find((x) => x.id === tid))
      .filter((t): t is Theme => !!t && this.visible(t));
  }

  /** Groupes ayant au moins un thème visible. */
  readonly groups = computed(() => GROUPS.filter((g) => this.visibleThemesOf(g.themeIds).length > 0));

  /** Aperçu : jusqu'à 4 vignettes de thèmes visibles du groupe. */
  groupPreview(g: { themeIds: string[] }): Theme[] {
    return this.visibleThemesOf(g.themeIds).slice(0, 4);
  }

  /** Coupe sur le groupe si tous ses thèmes visibles sont « champion ». */
  groupChampion(g: { themeIds: string[] }): boolean {
    const themes = this.visibleThemesOf(g.themeIds);
    return themes.length > 0 && themes.every((t) => this.progress.isChampion(t.id));
  }
}
