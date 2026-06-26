import { EmojiItem } from './emoji-item';

/**
 * Les jours de la semaine, en anglais. Pas d'emoji par jour → module de type `word` :
 * le visuel est le mot français, l'enfant choisit le mot anglais (traduction).
 * Thème non compatible avec le mode « écoute ».
 */
export const DAYS: EmojiItem[] = [
  { word: 'Monday', fr: 'lundi' },
  { word: 'Tuesday', fr: 'mardi' },
  { word: 'Wednesday', fr: 'mercredi' },
  { word: 'Thursday', fr: 'jeudi' },
  { word: 'Friday', fr: 'vendredi' },
  { word: 'Saturday', fr: 'samedi' },
  { word: 'Sunday', fr: 'dimanche' },
];
