import { Theme } from './themes';

/** Thèmes dynamiques de révision (pas d'étoiles, pas de grand test). */
export const ALL_ID = 'all';
export const CHAMPIONS_ID = 'champions';

export function isAggregateId(id: string | null | undefined): boolean {
  return id === ALL_ID || id === CHAMPIONS_ID;
}

const META: Record<string, { title: string; fr: string; tileEmoji: string; gradient: string }> = {
  [ALL_ID]: {
    title: 'All',
    fr: 'Tout mélangé',
    tileEmoji: '❓',
    gradient: 'linear-gradient(150deg, #8e44ad, #4dabf7)',
  },
  [CHAMPIONS_ID]: {
    title: 'Champions',
    fr: 'Mes coupes',
    tileEmoji: '🏆',
    gradient: 'linear-gradient(150deg, #ffd23f, #ff8c1a)',
  },
};

/** Construit un thème agrégé à partir de thèmes sources (déjà filtrés par l'appelant). */
export function buildAggregate(id: string, sources: Theme[]): Theme {
  const meta = META[id] ?? META[ALL_ID];
  // Dédoublonnage par clé (ex. « star » présent dans plusieurs thèmes).
  const seen = new Set<string>();
  const items = [];
  for (const s of sources) {
    for (const it of s.items) {
      if (!seen.has(it.key)) {
        seen.add(it.key);
        items.push(it);
      }
    }
  }
  return {
    id,
    title: meta.title,
    fr: meta.fr,
    tileEmoji: meta.tileEmoji,
    gradient: meta.gradient,
    kind: 'emoji',
    learnPath: `/review/${id}`,
    listen: sources.some((s) => s.listen),
    items,
  };
}
