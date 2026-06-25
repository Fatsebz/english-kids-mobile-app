export interface NumberItem {
  /** Valeur numérique (1 à 20) */
  value: number;
  /** Mot anglais (ex. "seven") */
  word: string;
}

const WORDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

/** Les nombres de 1 à 20, avec leur orthographe anglaise. */
export const NUMBERS: NumberItem[] = WORDS.map((word, i) => ({
  value: i + 1,
  word,
}));
