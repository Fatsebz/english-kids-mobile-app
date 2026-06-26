import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AggregateService } from '../../core/aggregate.service';

/** Écran d'un thème de révision dynamique (`/review/:id`) : choix du mode, sans progression. */
@Component({
  selector: 'app-review',
  imports: [RouterLink],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/" aria-label="Accueil">🏠</a>
        <h1 class="title">{{ title() }}</h1>
        <span class="btn-round" aria-hidden="true">{{ emoji() }}</span>
      </div>

      <p class="subtitle">{{ count() }} éléments · choisis comment jouer</p>

      <div class="modes">
        @for (m of modes(); track m) {
          <a class="btn play" [class.btn--green]="m === 'listen'" [routerLink]="['/quiz', id, m]">
            {{ m === 'listen' ? '👂 Écoute' : '📖 Lis le mot' }}
          </a>
        }
      </div>
    </main>
  `,
  styles: [
    `
      .modes {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 10px;
      }
      .play {
        text-align: center;
        text-decoration: none;
      }
    `,
  ],
})
export class Review {
  private readonly agg = inject(AggregateService);
  private readonly router = inject(Router);

  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  private readonly theme = computed(() => this.agg.meta(this.id));
  readonly title = computed(() => this.theme()?.title ?? '');
  readonly emoji = computed(() => this.theme()?.tileEmoji ?? '');
  readonly count = computed(() => this.theme()?.items.length ?? 0);
  readonly modes = computed(() => this.agg.modes(this.id));

  constructor() {
    if (!this.agg.visible(this.id)) {
      this.router.navigateByUrl('/');
    }
  }
}
