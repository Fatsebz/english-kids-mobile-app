import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Theme, THEMES } from '../../data/themes';
import { GROUPED_THEME_IDS, GROUPS } from '../../data/groups';
import { ProfileService } from '../../core/profile.service';
import { SettingsService } from '../../core/settings.service';
import { ProgressService } from '../../core/progress.service';
import { ThemeTile } from '../../shared/theme-tile/theme-tile';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ThemeTile],
  template: `
    <main class="screen home">
      <h1 class="title big">English Kids</h1>
      <p class="subtitle">Apprends l'anglais en jouant&nbsp;!</p>

      <div class="tiles">
        @for (g of groups(); track g.id) {
          <a class="tile group anim-pop" [routerLink]="['/g', g.id]" [style.background]="g.gradient">
            @if (groupChampion(g)) {
              <span class="badge"><span class="trophy" aria-label="Groupe terminé">🏆</span></span>
            }
            <span class="emoji">{{ g.tileEmoji }}</span>
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
      .tile.group .emoji {
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
  private readonly profiles = inject(ProfileService);
  private readonly settings = inject(SettingsService);
  private readonly progress = inject(ProgressService);

  /** Un thème est visible s'il est activé et qu'au moins un mode utilisable est dispo pour le profil. */
  private visible(t: Theme): boolean {
    const id = this.profiles.current()?.id;
    if (!id) return true;
    if (!this.settings.isThemeEnabled(id, t.id)) return false;
    return this.settings.modesFor(id).some((m) => m === 'read' || t.listen);
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

  /** Coupe sur le groupe si tous ses thèmes visibles sont « champion ». */
  groupChampion(g: { themeIds: string[] }): boolean {
    const themes = this.visibleThemesOf(g.themeIds);
    return themes.length > 0 && themes.every((t) => this.progress.isChampion(t.id));
  }
}
