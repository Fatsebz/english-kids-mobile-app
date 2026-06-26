import { inject, Injectable } from '@angular/core';
import { Theme, THEMES } from '../data/themes';
import { ALL_ID, CHAMPIONS_ID, buildAggregate, isAggregateId } from '../data/aggregate';
import { ProfileService } from './profile.service';
import { ProgressService } from './progress.service';
import { QuizMode, SettingsService } from './settings.service';

/**
 * Résout les thèmes dynamiques de révision pour le profil courant :
 * - `all` : tous les éléments des thèmes activés ;
 * - `champions` : idem, restreint aux thèmes déjà « champion » (coupe obtenue).
 */
@Injectable({ providedIn: 'root' })
export class AggregateService {
  private readonly profiles = inject(ProfileService);
  private readonly settings = inject(SettingsService);
  private readonly progress = inject(ProgressService);

  /** Thèmes sources (activés pour le profil ; + champion pour `champions`). */
  private sources(id: string): Theme[] {
    const pid = this.profiles.current()?.id;
    let src = THEMES.filter((t) => !pid || this.settings.isThemeEnabled(pid, t.id));
    if (id === CHAMPIONS_ID) {
      src = src.filter((t) => this.progress.isChampion(t.id));
    }
    return src;
  }

  /** Modes proposables : ceux du profil, « écoute » seulement si une source est écoutable. */
  modes(id: string): QuizMode[] {
    const pid = this.profiles.current()?.id;
    const profileModes: readonly QuizMode[] = pid ? this.settings.modesFor(pid) : ['read', 'listen'];
    const anyListen = this.sources(id).some((t) => t.listen);
    return profileModes.filter((m) => m === 'read' || anyListen);
  }

  /** Visible sur l'accueil si au moins une source et un mode utilisable. */
  visible(id: string): boolean {
    return this.sources(id).length > 0 && this.modes(id).length > 0;
  }

  /** Thème agrégé pour un mode donné (filtre les sources non écoutables en mode écoute). */
  theme(id: string, mode: QuizMode): Theme | undefined {
    if (!isAggregateId(id)) return undefined;
    let src = this.sources(id);
    if (mode === 'listen') src = src.filter((t) => t.listen);
    if (src.length === 0) return undefined;
    return buildAggregate(id, src);
  }

  /** Métadonnées (titre, etc.) sans dépendre d'un mode — pour la page de révision. */
  meta(id: string): Theme | undefined {
    if (!isAggregateId(id)) return undefined;
    const src = this.sources(id);
    return src.length ? buildAggregate(id, src) : buildAggregate(id, []);
  }
}

export { ALL_ID, CHAMPIONS_ID };
