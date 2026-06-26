import { Injectable, inject, signal } from '@angular/core';
import { ProfileService } from './profile.service';
import { THEMES } from '../data/themes';

export type QuizMode = 'read' | 'listen';
export const QUIZ_MODES: QuizMode[] = ['read', 'listen'];

interface ChildSettings {
  /**
   * Thèmes MASQUÉS (liste noire). Tout thème absent de cette liste est **affiché par défaut**,
   * y compris les thèmes ajoutés plus tard — aucun besoin de les activer dans les réglages.
   */
  hiddenThemes: string[];
  modes: QuizMode[];
  /** Vitesse de la voix en % de la normale (50 à 100). */
  rate: number;
}

const PIN_KEY = 'ek.adminPin';
const DEFAULT_PIN = '1234';
const DEFAULT_RATE = 90;
const RATE_MIN = 50;
const RATE_MAX = 100;
const clampRate = (n: number): number => Math.min(RATE_MAX, Math.max(RATE_MIN, Math.round(n)));

/**
 * Réglages par enfant (thèmes masqués, modes de quiz, vitesse) + code PIN admin.
 * Persistance locale `ek.settings.<childId>` et `ek.adminPin`.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly profiles = inject(ProfileService);

  /** Cache réactif des réglages par profil. */
  private readonly cache = signal<Record<string, ChildSettings>>({});

  // ---- Lecture ----
  modesFor(id: string): QuizMode[] {
    return this.get(id).modes;
  }
  isThemeEnabled(id: string, themeId: string): boolean {
    return !this.get(id).hiddenThemes.includes(themeId);
  }
  isModeEnabled(id: string, mode: QuizMode): boolean {
    return this.get(id).modes.includes(mode);
  }
  /** Vitesse de la voix (%) du profil. */
  rateFor(id: string): number {
    return this.get(id).rate;
  }

  // ---- Écriture ----
  setThemeEnabled(id: string, themeId: string, on: boolean): void {
    const cur = this.get(id);
    let hiddenThemes: string[];
    if (on) {
      hiddenThemes = cur.hiddenThemes.filter((t) => t !== themeId);
    } else {
      hiddenThemes = [...new Set([...cur.hiddenThemes, themeId])];
      // Ne jamais tout masquer : garder au moins un thème visible.
      if (hiddenThemes.length >= THEMES.length) return;
    }
    this.save(id, { ...cur, hiddenThemes });
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

  /** Supprime les réglages d'un profil (à la suppression du profil). */
  clear(id: string): void {
    this.cache.update((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
    try {
      localStorage.removeItem(this.key(id));
    } catch {
      /* ignore */
    }
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
  private get(id: string): ChildSettings {
    return this.cache()[id] ?? this.load(id);
  }

  private load(id: string): ChildSettings {
    try {
      const raw = localStorage.getItem(this.key(id));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ChildSettings> & { themes?: string[] };
        return {
          // Ancien format (liste blanche `themes`) → on repart de « rien masqué »
          // pour que tous les thèmes (existants et nouveaux) soient visibles par défaut.
          hiddenThemes: Array.isArray(parsed.hiddenThemes) ? parsed.hiddenThemes : [],
          modes: parsed.modes?.length ? parsed.modes : [...QUIZ_MODES],
          rate: parsed.rate ? clampRate(parsed.rate) : DEFAULT_RATE,
        };
      }
    } catch {
      /* ignore */
    }
    return { hiddenThemes: [], modes: [...QUIZ_MODES], rate: DEFAULT_RATE };
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
