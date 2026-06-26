import { Injectable, signal } from '@angular/core';

export interface Profile {
  /** Identifiant stable (clé de stockage `ek.progress.<id>` / `ek.settings.<id>`). */
  id: string;
  /** Prénom affiché. */
  name: string;
  /** Chemin de l'avatar (bundlé dans public/). */
  img: string;
}

/** Choix d'avatars disponibles à la création d'un profil (images bundlées). */
export interface Avatar {
  key: string;
  img: string;
}
export const AVATARS: Avatar[] = [
  { key: 'vico', img: 'profiles/vico.png' },
  { key: 'bille', img: 'profiles/bille.png' },
];

const CURRENT_KEY = 'ek.profile';
const LIST_KEY = 'ek.profiles';
const NAME_MAX = 20;
const MAX_PROFILES = 8;

/**
 * Gère la liste des profils enfants (créés par le parent) et le profil sélectionné,
 * persistés localement (hors-ligne). La liste vit dans `ek.profiles`, la sélection dans `ek.profile`.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  /** Liste réactive des profils. */
  readonly profiles = signal<Profile[]>(this.loadList());
  /** Profil courant (sélectionné), réactif. */
  readonly current = signal<Profile | null>(this.loadCurrent());

  /** Nombre maximal de profils. */
  readonly maxProfiles = MAX_PROFILES;
  readonly nameMax = NAME_MAX;

  // ---- Sélection ----
  select(id: string): void {
    const profile = this.profiles().find((p) => p.id === id) ?? null;
    this.current.set(profile);
    try {
      if (profile) {
        localStorage.setItem(CURRENT_KEY, profile.id);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    } catch {
      /* localStorage indisponible : on garde l'état en mémoire */
    }
  }

  clear(): void {
    this.select('');
  }

  // ---- Gestion des profils ----
  hasProfileId(id: string): boolean {
    return this.profiles().some((p) => p.id === id);
  }

  /** Crée un profil (prénom tronqué à 20). Renvoie le profil créé, ou null si la limite est atteinte. */
  addProfile(name: string, img: string): Profile | null {
    if (this.profiles().length >= MAX_PROFILES) return null;
    const profile: Profile = { id: this.newId(), name: this.cleanName(name), img };
    this.profiles.update((list) => [...list, profile]);
    this.persistList();
    return profile;
  }

  /** Recrée un profil en conservant un id précis (restauration de sauvegarde). No-op si l'id existe déjà. */
  createWithId(id: string, name: string, img: string): Profile | null {
    if (this.hasProfileId(id)) return null;
    const profile: Profile = { id, name: this.cleanName(name), img };
    this.profiles.update((list) => [...list, profile]);
    this.persistList();
    return profile;
  }

  renameProfile(id: string, name: string, img: string): void {
    this.profiles.update((list) =>
      list.map((p) => (p.id === id ? { ...p, name: this.cleanName(name), img } : p)),
    );
    this.persistList();
    if (this.current()?.id === id) {
      this.current.set(this.profiles().find((p) => p.id === id) ?? null);
    }
  }

  /** Retire un profil de la liste. Si c'est le profil courant, on désélectionne (→ guard /profiles). */
  removeProfile(id: string): void {
    this.profiles.update((list) => list.filter((p) => p.id !== id));
    this.persistList();
    if (this.current()?.id === id) this.clear();
  }

  // ---- Interne ----
  private cleanName(name: string): string {
    return name.trim().slice(0, NAME_MAX);
  }

  private newId(): string {
    try {
      return crypto.randomUUID().slice(0, 8);
    } catch {
      // Repli si crypto indisponible : id basé sur le compteur + horodatage.
      return 'p' + Date.now().toString(36);
    }
  }

  private loadCurrent(): Profile | null {
    try {
      const id = localStorage.getItem(CURRENT_KEY);
      return this.profiles().find((p) => p.id === id) ?? null;
    } catch {
      return null;
    }
  }

  private loadList(): Profile[] {
    try {
      const raw = localStorage.getItem(LIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Profile[];
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => p && p.id && p.name && p.img);
        }
      }
    } catch {
      /* ignore */
    }
    // Aucun profil au départ : l'écran de sélection proposera de créer le premier.
    return [];
  }

  private persistList(): void {
    this.writeList(this.profiles());
  }

  private writeList(list: Profile[]): void {
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(list));
    } catch {
      /* quota / mode privé : on garde l'état en mémoire */
    }
  }
}
