import { Injectable, computed, inject, signal } from '@angular/core';
import { ProfileService } from './profile.service';
import { THEMES } from '../data/themes';

export type QuizMode = 'read' | 'listen';
export const QUIZ_MODES: QuizMode[] = ['read', 'listen'];

interface ChildSettings {
  themes: string[];
  modes: QuizMode[];
  /** Vitesse de la voix en % de la normale (50 à 100). */
  rate: number;
}

const ALL_THEMES = (): string[] => THEMES.map((t) => t.id);
const PIN_KEY = 'ek.adminPin';
const DEFAULT_PIN = '1234';
const DEFAULT_RATE = 90;
const RATE_MIN = 50;
const RATE_MAX = 100;
const clampRate = (n: number): number => Math.min(RATE_MAX, Math.max(RATE_MIN, Math.round(n)));

/**
 * Réglages par enfant (thèmes affichés, modes de quiz) + code PIN admin.
 * Persistance locale `ek.settings.<childId>` et `ek.adminPin`.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly profiles = inject(ProfileService);

  /** Cache réactif des réglages par profil (rechargé/écrit à la demande). */
  private readonly cache = signal<Record<string, ChildSettings>>({});

  /** Réglages du profil courant (réactif). */
  readonly currentThemes = computed(() => {
    const id = this.profiles.current()?.id;
    return id ? this.get(id).themes : ALL_THEMES();
  });
  readonly currentModes = computed(() => {
    const id = this.profiles.current()?.id;
    return id ? this.get(id).modes : [...QUIZ_MODES];
  });

  // ---- Lecture ----
  themesFor(id: string): string[] {
    return this.get(id).themes;
  }
  modesFor(id: string): QuizMode[] {
    return this.get(id).modes;
  }
  isThemeEnabled(id: string, themeId: string): boolean {
    return this.get(id).themes.includes(themeId);
  }
  isModeEnabled(id: string, mode: QuizMode): boolean {
    return this.get(id).modes.includes(mode);
  }
  /** Vitesse de la voix (%) du profil. */
  rateFor(id: string): number {
    return this.get(id).rate;
  }

  // ---- Écriture (garde ≥ 1 thème et ≥ 1 mode) ----
  setThemeEnabled(id: string, themeId: string, on: boolean): void {
    const cur = this.get(id);
    let themes = on ? [...new Set([...cur.themes, themeId])] : cur.themes.filter((t) => t !== themeId);
    if (themes.length === 0) themes = [themeId]; // ne jamais tout masquer
    this.save(id, { ...cur, themes });
  }
  setModeEnabled(id: string, mode: QuizMode, on: boolean): void {
    const cur = this.get(id);
    let modes = on ? [...new Set([...cur.modes, mode])] : cur.modes.filter((m) => m !== mode);
    if (modes.length === 0) modes = [mode];
    this.save(id, { ...cur, modes });
  }
  setRate(id: string, percent: number): void {
    this.save(id, { ...this.get(id), rate: clampRate(percent) });
  }

  // ---- PIN ----
  checkPin(pin: string): boolean {
    return pin === this.pin();
  }
  setPin(pin: string): void {
    try {
      localStorage.setItem(PIN_KEY, pin);
    } catch {
      /* ignore */
    }
  }
  private pin(): string {
    try {
      return localStorage.getItem(PIN_KEY) ?? DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  }

  // ---- Interne ----
  // Lecture PURE (jamais d'écriture de signal ici) : sinon NG0600 si appelée pendant le rendu.
  // La réactivité vient de la dépendance à `cache()` ; `save()` met à jour le signal.
  private get(id: string): ChildSettings {
    return this.cache()[id] ?? this.load(id);
  }

  private load(id: string): ChildSettings {
    try {
      const raw = localStorage.getItem(this.key(id));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ChildSettings>;
        return {
          themes: parsed.themes?.length ? parsed.themes : ALL_THEMES(),
          modes: parsed.modes?.length ? parsed.modes : [...QUIZ_MODES],
          rate: parsed.rate ? clampRate(parsed.rate) : DEFAULT_RATE,
        };
      }
    } catch {
      /* ignore */
    }
    return { themes: ALL_THEMES(), modes: [...QUIZ_MODES], rate: DEFAULT_RATE };
  }

  private save(id: string, value: ChildSettings): void {
    this.cache.update((c) => ({ ...c, [id]: value }));
    try {
      localStorage.setItem(this.key(id), JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }

  private key(id: string): string {
    return `ek.settings.${id}`;
  }
}
