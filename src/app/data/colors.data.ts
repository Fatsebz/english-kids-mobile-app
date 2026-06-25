export interface ColorItem {
  /** Nom anglais (ex. "red") — contenu enseigné */
  name: string;
  /** Traduction française (indice discret) */
  fr: string;
  /** Couleur d'affichage de la pastille */
  hex: string;
  /** true si la pastille a besoin d'une bordure (couleurs très claires) */
  light?: boolean;
}

/** Les couleurs de base, en anglais. */
export const COLORS: ColorItem[] = [
  { name: 'red', fr: 'rouge', hex: '#e63946' },
  { name: 'blue', fr: 'bleu', hex: '#1d6fe0' },
  { name: 'green', fr: 'vert', hex: '#2ec27e' },
  { name: 'yellow', fr: 'jaune', hex: '#ffd23f', light: true },
  { name: 'orange', fr: 'orange', hex: '#ff8c1a' },
  { name: 'purple', fr: 'violet', hex: '#8e44ad' },
  { name: 'pink', fr: 'rose', hex: '#ff6fae' },
  { name: 'brown', fr: 'marron', hex: '#8b5a2b' },
  { name: 'black', fr: 'noir', hex: '#2b2d42' },
  { name: 'white', fr: 'blanc', hex: '#ffffff', light: true },
  { name: 'gray', fr: 'gris', hex: '#9aa0a6' },
];
