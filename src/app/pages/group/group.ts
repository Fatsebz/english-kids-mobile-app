import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Theme, THEMES } from '../../data/themes';
import { findGroup } from '../../data/groups';
import { SettingsService } from '../../core/settings.service';
import { ThemeTile } from '../../shared/theme-tile/theme-tile';

/** Sous-écran d'un groupe (`/g/:id`) : liste les thèmes du groupe, visibles pour le profil. */
@Component({
  selector: 'app-group',
  imports: [RouterLink, ThemeTile],
  template: `
    <main class="screen home">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">{{ title }}</h1>
        <span class="btn-round" aria-hidden="true">{{ tileEmoji }}</span>
      </div>

      <div class="tiles">
        @for (t of themes(); track t.id) {
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
      .tiles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-top: 6px;
      }
    `,
  ],
})
export class Group {
  private readonly settings = inject(SettingsService);
  private readonly router = inject(Router);

  private readonly group = findGroup(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly title = this.group?.title ?? '';
  readonly tileEmoji = this.group?.tileEmoji ?? '';

  constructor() {
    if (!this.group) {
      this.router.navigateByUrl('/');
    }
  }

  readonly themes = computed(() =>
    (this.group?.themeIds ?? [])
      .map((tid) => THEMES.find((t) => t.id === tid))
      .filter((t): t is Theme => !!t && this.settings.isThemeVisibleForCurrent(t)),
  );
}
