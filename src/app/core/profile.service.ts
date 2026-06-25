import { Injectable, signal } from '@angular/core';

export interface Profile {
  /** Identifiant stable (clé de stockage). */
  id: string;
  /** Prénom affiché. */
  name: string;
  /** Chemin de l'avatar (bundlé dans public/). */
  img: string;
}

const STORAGE_KEY = 'ek.profile';

/** Profils disponibles (figés). */
export const PROFILES: Profile[] = [
  { id: 'vico', name: 'Victor', img: 'profiles/vico.png' },
  { id: 'bille', name: 'Bertille', img: 'profiles/bille.png' },
];

/** Gère le profil enfant sélectionné, persisté localement (hors-ligne). */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly profiles = PROFILES;
  readonly current = signal<Profile | null>(this.load());

  select(id: string): void {
    const profile = PROFILES.find((p) => p.id === id) ?? null;
    this.current.set(profile);
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEY, profile.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* localStorage indisponible : on garde l'état en mémoire */
    }
  }

  clear(): void {
    this.select('');
  }

  private load(): Profile | null {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      return PROFILES.find((p) => p.id === id) ?? null;
    } catch {
      return null;
    }
  }
}
