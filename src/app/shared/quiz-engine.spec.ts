import { buildQuestion, choicesFor, pickTarget, shuffle } from './quiz-engine';

interface Item {
  key: string;
}
const keyOf = (i: Item) => i.key;
const items: Item[] = ['a', 'b', 'c', 'd', 'e'].map((key) => ({ key }));

describe('quiz-engine', () => {
  describe('shuffle', () => {
    it('garde les mêmes éléments sans muter la source', () => {
      const src = [1, 2, 3, 4];
      const out = shuffle(src);
      expect(out).not.toBe(src);
      expect([...out].sort()).toEqual([1, 2, 3, 4]);
    });
  });

  describe('buildQuestion', () => {
    it('produit 4 choix dont la bonne réponse, sans doublon', () => {
      const q = buildQuestion(items, 4);
      expect(q.choices.length).toBe(4);
      expect(q.choices).toContain(q.answer);
      expect(new Set(q.choices).size).toBe(4);
    });

    it('évite la réponse précédente quand demandé', () => {
      const prev = items[0];
      for (let i = 0; i < 20; i++) {
        expect(buildQuestion(items, 4, prev).answer).not.toBe(prev);
      }
    });
  });

  describe('choicesFor', () => {
    it('inclut la cible et le bon nombre de propositions', () => {
      const target = items[2];
      const choices = choicesFor(items, target, keyOf, 4);
      expect(choices.length).toBe(4);
      expect(choices).toContain(target);
      expect(new Set(choices.map(keyOf)).size).toBe(4);
    });
  });

  describe('pickTarget', () => {
    const empty = new Set<string>();

    it('choisit un élément non maîtrisé en priorité', () => {
      const mastered = new Set(['a', 'b', 'c', 'd']); // seul "e" non maîtrisé
      for (let i = 0; i < 20; i++) {
        expect(pickTarget(items, keyOf, mastered, empty).key).toBe('e');
      }
    });

    it('parmi les non maîtrisés, préfère ceux non encore proposés', () => {
      const mastered = new Set(['a', 'b']); // c, d, e non maîtrisés
      const seen = new Set(['c', 'd']); // seul "e" non vu
      for (let i = 0; i < 20; i++) {
        expect(pickTarget(items, keyOf, mastered, seen).key).toBe('e');
      }
    });

    it('retombe sur tous les éléments quand tout est maîtrisé et vu', () => {
      const all = new Set(items.map(keyOf));
      const t = pickTarget(items, keyOf, all, all);
      expect(items.map(keyOf)).toContain(t.key);
    });

    it('évite la cible précédente quand le seau le permet', () => {
      const mastered = new Set(['a', 'b', 'c']); // d, e non maîtrisés
      for (let i = 0; i < 20; i++) {
        expect(pickTarget(items, keyOf, mastered, empty, 'd').key).toBe('e');
      }
    });
  });
});
