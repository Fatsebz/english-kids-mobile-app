/** Mélange un tableau (copie, algorithme de Fisher–Yates). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Question<T> {
  /** La bonne réponse (l'item cible). */
  answer: T;
  /** Les 4 propositions, déjà mélangées (dont la bonne réponse). */
  choices: T[];
}

/**
 * Construit une question : une cible + (choiceCount-1) distracteurs uniques, le tout mélangé.
 * `avoid` permet d'éviter de reposer immédiatement la même question.
 */
export function buildQuestion<T>(
  items: readonly T[],
  choiceCount = 4,
  avoid?: T,
): Question<T> {
  const pool = avoid && items.length > 1 ? items.filter((it) => it !== avoid) : items;
  const answer = pool[Math.floor(Math.random() * pool.length)];

  const distractors = shuffle(items.filter((it) => it !== answer)).slice(
    0,
    Math.max(0, Math.min(choiceCount, items.length) - 1),
  );

  return { answer, choices: shuffle([answer, ...distractors]) };
}
