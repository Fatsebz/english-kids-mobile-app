/**
 * Version de l'application et journal des modifications (changelog).
 * SOURCE UNIQUE de la version affichée dans l'app (écran Réglages).
 *
 * Pour publier une version : ajouter une entrée EN TÊTE de CHANGELOG, mettre à jour
 * APP_VERSION, puis aligner `android/app/build.gradle` (versionName = APP_VERSION,
 * incrémenter versionCode) et `package.json`.
 */
export const APP_VERSION = '1.3.0';

export interface ChangelogEntry {
  version: string;
  /** Date ISO (AAAA-MM-JJ). */
  date: string;
  changes: string[];
}

/** Du plus récent au plus ancien. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-06-29',
    changes: [
      'Nouveaux thèmes : Jeux 🎲 et Pièces de la maison 🛋️, regroupés (Loisirs : jeux, sport, musique)',
      'Option « Je sais lire » par profil : masque les thèmes « texte » (heure, jours, mois) pour les non-lecteurs',
      'Mode apprentissage : bouton de prononciation en français 🇫🇷 en plus de l’anglais 🇬🇧',
      'Choix de la voix anglaise par profil (homme / femme, britannique 🇬🇧 ou américaine 🇺🇸)',
      'Possibilité de désactiver le code parent',
      'Réglages réorganisés (réglages de l’enfant / généraux) + liste de tous les éléments par thème',
      'Écran de démarrage plus net',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-06-26',
    changes: [
      'Application allégée : taille d’installation réduite (~16 → ~4 Mo)',
      'Nouvelle icône : le logo English Kidz sur fond bleu',
      'Démarrage simplifié (écran d’ouverture épuré)',
      'Renommage en « English Kidz » (cohérence avec le logo)',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-06-26',
    changes: [
      'Profils personnalisables : créer, renommer et supprimer un profil',
      'Création d’un profil (prénom + avatar) depuis l’écran « Qui joue ? » ou les Réglages',
      'Restauration d’une sauvegarde avec remappage des identifiants de profil',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-26',
    changes: [
      'Thèmes de révision : « Tout mélangé » (❓) et « Champions » (🏆)',
      'Réglages réorganisés en accordéon (sections repliables, plus lisible)',
      'Écran « À propos » avec la version et le journal des modifications',
      'Lecture du nom anglais au clic sur un thème ou un groupe',
      'Groupes illustrés par un aperçu des thèmes qu’ils contiennent',
      'Nouveaux thèmes et éléments (insectes, sel, poivre…) et icônes dédiées',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-26',
    changes: [
      'Profils enfants avec progression mémorisée par profil',
      'Étoiles par thème (1/2/3) et « grand test » récompensé par une coupe',
      'Deux modes de quiz : lire le mot et écouter pour choisir l’image',
      'Réglages parent protégés par code : thèmes affichés, modes, vitesse de la voix',
      'Sauvegarde / restauration de la progression',
      'Plus de 25 thèmes regroupés (Animaux, Concepts, Temps, Nourriture…)',
      'Prononciation anglaise hors-ligne + icônes dédiées pour les mots sans emoji',
    ],
  },
];
