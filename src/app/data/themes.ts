import { NUMBERS } from './numbers.data';
import { COLORS } from './colors.data';
import { MODULES } from './modules';

export type ThemeKind = 'number' | 'color' | 'emoji';

/** Élément normalisé d'un thème, exploitable par l'accueil et le grand test. */
export interface ThemeEntry {
  /** Clé stable (sert au suivi de progression). */
  key: string;
  /** Texte anglais (la bonne réponse / le mot prononcé). */
  label: string;
  /** Visuel à afficher dans le prompt : chiffre, couleur (hex) ou emoji. */
  display: string;
  /** Couleurs claires uniquement : ajoute une bordure. */
  light?: boolean;
}

/** Description unifiée d'un thème (Numbers, Colors ou module emoji). */
export interface Theme {
  id: string;
  title: string;
  fr: string;
  tileEmoji: string;
  gradient: string;
  kind: ThemeKind;
  /** Route de l'écran « Apprendre ». */
  learnPath: string;
  items: ThemeEntry[];
  /** Compatible avec le mode « écoute → choisir l'image » (visuel distinct par élément). */
  listen: boolean;
}

const numbersTheme: Theme = {
  id: 'numbers',
  title: 'Numbers',
  fr: 'Les nombres',
  tileEmoji: '🔢',
  gradient: 'linear-gradient(150deg, #ff6b6b, #ff8e53)',
  kind: 'number',
  learnPath: '/numbers',
  listen: true,
  items: NUMBERS.map((n) => ({ key: String(n.value), label: n.word, display: String(n.value) })),
};

const colorsTheme: Theme = {
  id: 'colors',
  title: 'Colors',
  fr: 'Les couleurs',
  tileEmoji: '🎨',
  gradient: 'linear-gradient(150deg, #4dabf7, #2ec27e)',
  kind: 'color',
  learnPath: '/colors',
  listen: true,
  items: COLORS.map((c) => ({ key: c.name, label: c.name, display: c.hex, light: c.light })),
};

const emojiThemes: Theme[] = MODULES.map((m) => ({
  id: m.id,
  title: m.title,
  fr: m.fr,
  tileEmoji: m.tileEmoji,
  gradient: m.gradient,
  kind: 'emoji' as const,
  learnPath: `/m/${m.id}`,
  listen: m.listen ?? true,
  items: m.items.map((it) => ({ key: it.word, label: it.word, display: it.emoji })),
}));

/** Tous les thèmes, dans l'ordre d'affichage de l'accueil. */
export const THEMES: Theme[] = [numbersTheme, colorsTheme, ...emojiThemes];

export function findTheme(id: string | null | undefined): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
