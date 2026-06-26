import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { ProgressService } from '../../core/progress.service';
import { QuizMode, SettingsService } from '../../core/settings.service';
import { findTheme } from '../../data/themes';

/**
 * Boutons d'accès aux quiz (modes activés pour le profil courant) + grand test par mode.
 * 1 ou 2 grands tests selon les modes autorisés ; réussir l'un OU l'autre donne la coupe.
 * Utilisé dans les pages « Apprendre ».
 */
@Component({
  selector: 'app-play-buttons',
  imports: [RouterLink],
  template: `
    <div class="play-buttons">
      @for (m of availableModes(); track m) {
        <a class="btn play" [class.btn--green]="m === 'listen'" [routerLink]="['/quiz', themeId(), m]">
          {{ m === 'listen' ? '👂 Écoute' : '📖 Lis le mot' }}
        </a>
      }

      @for (m of availableModes(); track m) {
        @if (unlocked()) {
          <a class="btn grand" [routerLink]="['/test', themeId(), m]">
            🏆 {{ testLabel(m) }}
          </a>
        } @else {
          <span class="btn grand locked">🔒 {{ testLabel(m) }}</span>
        }
      }
    </div>
  `,
  styles: [
    `
      .play-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
      }
      .play {
        flex: 1 1 40%;
        text-align: center;
        text-decoration: none;
      }
      .grand {
        flex: 1 1 40%;
        text-align: center;
        text-decoration: none;
        background: var(--c-accent);
        color: var(--c-text);
        box-shadow: 0 6px 0 #c9a200;
      }
      .grand:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 #c9a200;
      }
      .grand.locked {
        opacity: 0.55;
        box-shadow: 0 6px 0 #c9a200;
      }
    `,
  ],
})
export class PlayButtons {
  private readonly settings = inject(SettingsService);
  private readonly profiles = inject(ProfileService);
  private readonly progress = inject(ProgressService);

  readonly themeId = input.required<string>();

  private readonly modes = computed<readonly QuizMode[]>(() => {
    const id = this.profiles.current()?.id;
    return id ? this.settings.modesFor(id) : (['read', 'listen'] as const);
  });

  /** Modes réellement proposables : retire « écoute » si le thème ne le supporte pas. */
  readonly availableModes = computed<readonly QuizMode[]>(() => {
    const listenable = findTheme(this.themeId())?.listen ?? true;
    return this.modes().filter((m) => m !== 'listen' || listenable);
  });

  readonly unlocked = computed(() => {
    const total = findTheme(this.themeId())?.items.length ?? 0;
    return this.progress.stars(this.themeId(), total) >= 3;
  });

  /** Libellé du grand test : précise le mode seulement s'il y en a deux. */
  testLabel(mode: QuizMode): string {
    if (this.availableModes().length < 2) return 'Grand test';
    return mode === 'listen' ? 'Grand test 👂' : 'Grand test 📖';
  }
}
