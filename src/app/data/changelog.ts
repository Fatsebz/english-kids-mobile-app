/**
 * Version de l'application et journal des modifications (changelog).
 * SOURCE UNIQUE de la version affichée dans l'app (écran Réglages).
 *
 * Pour publier une version : ajouter une entrée EN TÊTE de CHANGELOG, mettre à jour
 * APP_VERSION, puis aligner `android/app/build.gradle` (versionName = APP_VERSION,
 * incrémenter versionCode) et `package.json`.
 */
export const APP_VERSION = '1.0.0';

export interface ChangelogEntry {
  version: string;
  /** Date ISO (AAAA-MM-JJ). */
  date: string;
  changes: string[];
}

/** Du plus récent au plus ancien. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-06-26',
    changes: [
      'Profils enfants (Victor / Bertille) avec progression mémorisée par profil',
      'Étoiles par thème (1/2/3) et « grand test » récompensé par une coupe',
      'Deux modes de quiz : lire le mot et écouter pour choisir l’image',
      'Réglages parent protégés par code : thèmes affichés, modes, vitesse de la voix',
      'Sauvegarde / restauration de la progression',
      'Plus de 25 thèmes regroupés (Animaux, Concepts, Temps, Nourriture…)',
      'Prononciation anglaise hors-ligne + icônes dédiées pour les mots sans emoji',
    ],
  },
];
