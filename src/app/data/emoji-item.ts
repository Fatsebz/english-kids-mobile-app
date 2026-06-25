/** Élément générique d'un module illustré par un emoji. */
export interface EmojiItem {
  /** Emoji affiché (rendu par la police système, aucune ressource distante). */
  emoji: string;
  /** Mot anglais — contenu enseigné. */
  word: string;
  /** Traduction française (indice discret). */
  fr: string;
}
