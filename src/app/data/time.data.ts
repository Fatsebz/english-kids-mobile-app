import { EmojiItem } from './emoji-item';

/**
 * Les unités de temps, en anglais. Pas d'emoji distinct → module de type `word` :
 * le visuel est le mot français, l'enfant choisit le mot anglais (traduction).
 */
export const TIMEUNITS: EmojiItem[] = [
  { word: 'second', fr: 'seconde' },
  { word: 'minute', fr: 'minute' },
  { word: 'hour', fr: 'heure' },
  { word: 'day', fr: 'jour' },
  { word: 'week', fr: 'semaine' },
  { word: 'month', fr: 'mois' },
  { word: 'year', fr: 'année' },
];
