import { EmojiItem } from './emoji-item';

/**
 * L'alphabet anglais. Cas particulier : il n'existe pas d'emoji par lettre, donc
 * le « visuel » est la **majuscule**, le mot prononcé est la lettre (« A »),
 * et l'indice FR est la **minuscule** (apprentissage de l'association maj./min.).
 */
export const LETTERS: EmojiItem[] = [
  { emoji: 'A', word: 'A', fr: 'a' },
  { emoji: 'B', word: 'B', fr: 'b' },
  { emoji: 'C', word: 'C', fr: 'c' },
  { emoji: 'D', word: 'D', fr: 'd' },
  { emoji: 'E', word: 'E', fr: 'e' },
  { emoji: 'F', word: 'F', fr: 'f' },
  { emoji: 'G', word: 'G', fr: 'g' },
  { emoji: 'H', word: 'H', fr: 'h' },
  { emoji: 'I', word: 'I', fr: 'i' },
  { emoji: 'J', word: 'J', fr: 'j' },
  { emoji: 'K', word: 'K', fr: 'k' },
  { emoji: 'L', word: 'L', fr: 'l' },
  { emoji: 'M', word: 'M', fr: 'm' },
  { emoji: 'N', word: 'N', fr: 'n' },
  { emoji: 'O', word: 'O', fr: 'o' },
  { emoji: 'P', word: 'P', fr: 'p' },
  { emoji: 'Q', word: 'Q', fr: 'q' },
  { emoji: 'R', word: 'R', fr: 'r' },
  { emoji: 'S', word: 'S', fr: 's' },
  { emoji: 'T', word: 'T', fr: 't' },
  { emoji: 'U', word: 'U', fr: 'u' },
  { emoji: 'V', word: 'V', fr: 'v' },
  { emoji: 'W', word: 'W', fr: 'w' },
  { emoji: 'X', word: 'X', fr: 'x' },
  { emoji: 'Y', word: 'Y', fr: 'y' },
  { emoji: 'Z', word: 'Z', fr: 'z' },
];
