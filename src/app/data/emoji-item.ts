/** Élément générique d'un module, illustré par un emoji ou une icône SVG bundlée. */
export interface EmojiItem {
  /** Emoji affiché (rendu par la police système). Optionnel si `img` est fourni. */
  emoji?: string;
  /**
   * Chemin d'une icône bundlée (ex. `icons/fork.svg`), pour les concepts sans emoji
   * clair (fork, gomme, table…) ou pour lever une ambiguïté (sorcière vs magicien).
   * Prioritaire sur `emoji`. 100 % hors-ligne (servie depuis `public/`).
   */
  img?: string;
  /** Mot anglais — contenu enseigné. */
  word: string;
  /** Traduction française (indice discret). */
  fr: string;
}
