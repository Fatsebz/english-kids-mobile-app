import { EmojiItem } from './emoji-item';

/**
 * Les mois de l'année, en anglais. Pas d'emoji par mois → module de type `word` :
 * le visuel est le mot français, l'enfant choisit le mot anglais (traduction).
 * Thème non compatible avec le mode « écoute ».
 */
export const MONTHS: EmojiItem[] = [
  { word: 'January', fr: 'janvier' },
  { word: 'February', fr: 'février' },
  { word: 'March', fr: 'mars' },
  { word: 'April', fr: 'avril' },
  { word: 'May', fr: 'mai' },
  { word: 'June', fr: 'juin' },
  { word: 'July', fr: 'juillet' },
  { word: 'August', fr: 'août' },
  { word: 'September', fr: 'septembre' },
  { word: 'October', fr: 'octobre' },
  { word: 'November', fr: 'novembre' },
  { word: 'December', fr: 'décembre' },
];
