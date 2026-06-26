import { EmojiItem } from './emoji-item';

/**
 * Les jours de la semaine, en anglais. Pas d'emoji par jour → le « visuel » est le
 * numéro du jour (1 = lundi …). Thème non compatible avec le mode « écoute ».
 */
export const DAYS: EmojiItem[] = [
  { emoji: '1', word: 'Monday', fr: 'lundi' },
  { emoji: '2', word: 'Tuesday', fr: 'mardi' },
  { emoji: '3', word: 'Wednesday', fr: 'mercredi' },
  { emoji: '4', word: 'Thursday', fr: 'jeudi' },
  { emoji: '5', word: 'Friday', fr: 'vendredi' },
  { emoji: '6', word: 'Saturday', fr: 'samedi' },
  { emoji: '7', word: 'Sunday', fr: 'dimanche' },
];
