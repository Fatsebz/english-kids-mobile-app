/** Groupe de thèmes (niveau intermédiaire sur l'accueil quand un thème en regroupe plusieurs). */
export interface ThemeGroup {
  id: string;
  title: string;
  fr: string;
  tileEmoji: string;
  gradient: string;
  /** Ids des thèmes (cf. `themes.ts`) regroupés. */
  themeIds: string[];
}

export const GROUPS: ThemeGroup[] = [
  {
    id: 'animals',
    title: 'Animals',
    fr: 'Les animaux',
    tileEmoji: '🐾',
    gradient: 'linear-gradient(150deg, #2ec27e, #ffd23f)',
    themeIds: ['animals', 'pets', 'zoo', 'forest', 'insects'],
  },
  {
    id: 'concepts',
    title: 'Concepts',
    fr: 'Les concepts',
    tileEmoji: '🔢',
    gradient: 'linear-gradient(150deg, #ff6b6b, #8e44ad)',
    themeIds: ['numbers', 'letters', 'shapes', 'colors'],
  },
  {
    id: 'time',
    title: 'Time',
    fr: 'Le temps',
    tileEmoji: '⏰',
    gradient: 'linear-gradient(150deg, #4dabf7, #8e44ad)',
    themeIds: ['days', 'months', 'timeunits', 'seasons', 'weather'],
  },
  {
    id: 'food',
    title: 'Food',
    fr: 'La nourriture',
    tileEmoji: '🍔',
    gradient: 'linear-gradient(150deg, #ff8c1a, #ffd23f)',
    themeIds: ['food', 'fruits', 'vegetables', 'tableware'],
  },
];

export function findGroup(id: string | null | undefined): ThemeGroup | undefined {
  return GROUPS.find((g) => g.id === id);
}

/** Tous les ids de thèmes appartenant à un groupe (pour ne pas les afficher en direct sur l'accueil). */
export const GROUPED_THEME_IDS: ReadonlySet<string> = new Set(GROUPS.flatMap((g) => g.themeIds));
