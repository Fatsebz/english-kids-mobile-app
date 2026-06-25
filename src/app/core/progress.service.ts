import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ProfileService } from './profile.service';

/** Progression d'un thème : éléments réussis (distincts) + grand test gagné. */
export interface ThemeProgress {
  mastered: string[];
  champion: boolean;
}

type ProgressMap = Record<string, ThemeProgress>;

/**
 * Suit la progression par profil (étoiles + grand test), persistée localement.
 * Stockage : `ek.progress.<profileId>` → { [themeId]: { mastered, champion } }.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly profiles = inject(ProfileService);

  /** Carte de progression du profil courant (signal pour réactivité de l'UI). */
  private readonly state = signal<ProgressMap>({});

  /** Profil courant, exposé pour les `computed` éventuels. */
  readonly profileId = computed(() => this.profiles.current()?.id ?? null);

  constructor() {
    // Recharge la progression à chaque changement de profil.
    effect(() => {
      const id = this.profiles.current()?.id ?? null;
      this.state.set(id ? this.load(id) : {});
    });
  }

  /** Nombre d'étoiles (0..3) pour un thème de `total` éléments. */
  stars(themeId: string, total: number): number {
    const count = this.state()[themeId]?.mastered.length ?? 0;
    if (count <= 0) return 0;
    if (count >= total) return 3;
    if (count >= Math.ceil(total / 2)) return 2;
    return 1;
  }

  /** Le grand test du thème est-il réussi ? */
  isChampion(themeId: string): boolean {
    return this.state()[themeId]?.champion ?? false;
  }

  /** Nombre d'éléments distincts réussis pour un thème. */
  masteredCount(themeId: string): number {
    return this.state()[themeId]?.mastered.length ?? 0;
  }

  /** Ensemble des clés réussies pour un thème (profil courant). */
  masteredSet(themeId: string): Set<string> {
    return new Set(this.state()[themeId]?.mastered ?? []);
  }

  /** Enregistre une bonne réponse sur l'élément `key` du thème. */
  recordCorrect(themeId: string, key: string): void {
    const entry = this.entry(themeId);
    if (entry.mastered.includes(key)) return;
    this.update(themeId, { ...entry, mastered: [...entry.mastered, key] });
  }

  /** Marque le grand test du thème comme réussi. */
  setChampion(themeId: string): void {
    const entry = this.entry(themeId);
    if (entry.champion) return;
    this.update(themeId, { ...entry, champion: true });
  }

  /** Réinitialise toute la progression d'un profil (admin). */
  resetProfile(profileId: string): void {
    this.persistFor(profileId, {});
    if (profileId === this.profileId()) this.state.set({});
  }

  /** Réinitialise la progression d'un seul thème pour un profil (admin). */
  resetTheme(profileId: string, themeId: string): void {
    const map = profileId === this.profileId() ? this.state() : this.load(profileId);
    const next = { ...map };
    delete next[themeId];
    this.persistFor(profileId, next);
    if (profileId === this.profileId()) this.state.set(next);
  }

  private entry(themeId: string): ThemeProgress {
    return this.state()[themeId] ?? { mastered: [], champion: false };
  }

  private update(themeId: string, value: ThemeProgress): void {
    const next: ProgressMap = { ...this.state(), [themeId]: value };
    this.state.set(next);
    this.persist(next);
  }

  private storageKey(id: string): string {
    return `ek.progress.${id}`;
  }

  private load(id: string): ProgressMap {
    try {
      const raw = localStorage.getItem(this.storageKey(id));
      return raw ? (JSON.parse(raw) as ProgressMap) : {};
    } catch {
      return {};
    }
  }

  private persist(map: ProgressMap): void {
    const id = this.profileId();
    if (id) this.persistFor(id, map);
  }

  private persistFor(profileId: string, map: ProgressMap): void {
    try {
      localStorage.setItem(this.storageKey(profileId), JSON.stringify(map));
    } catch {
      /* quota / mode privé : on garde l'état en mémoire */
    }
  }
}
