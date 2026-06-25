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

/** Tire un élément au hasard dans un tableau non vide. */
function randomOf<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Choisit la prochaine cible en priorisant les éléments **non maîtrisés** et **non encore proposés**
 * cette session. Ordre des seaux (premier non vide gagne) :
 *   (a) non maîtrisé ET non vu → (b) non maîtrisé → (c) non vu → (d) tous.
 * `avoid` (clé) est évité tant que le seau contient autre chose.
 */
export function pickTarget<T>(
  items: readonly T[],
  keyOf: (x: T) => string,
  mastered: ReadonlySet<string>,
  seen: ReadonlySet<string>,
  avoid?: string,
): T {
  const notMastered = items.filter((it) => !mastered.has(keyOf(it)));
  const notSeen = items.filter((it) => !seen.has(keyOf(it)));
  const notMasteredNotSeen = notMastered.filter((it) => !seen.has(keyOf(it)));

  const bucket =
    notMasteredNotSeen.length ? notMasteredNotSeen :
    notMastered.length ? notMastered :
    notSeen.length ? notSeen :
    items;

  const avoidable = avoid && bucket.length > 1 ? bucket.filter((it) => keyOf(it) !== avoid) : bucket;
  return randomOf(avoidable.length ? avoidable : bucket);
}

/** Construit les propositions pour une cible donnée : cible + (choiceCount-1) distracteurs, mélangés. */
export function choicesFor<T>(
  items: readonly T[],
  target: T,
  keyOf: (x: T) => string,
  choiceCount = 4,
): T[] {
  const targetKey = keyOf(target);
  const distractors = shuffle(items.filter((it) => keyOf(it) !== targetKey)).slice(
    0,
    Math.max(0, Math.min(choiceCount, items.length) - 1),
  );
  return shuffle([target, ...distractors]);
}
