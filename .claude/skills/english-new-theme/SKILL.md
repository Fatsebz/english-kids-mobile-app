---
name: english-new-theme
description: Ajoute un nouveau module d'apprentissage « emoji » à English Kids (ex. fruits, famille, vêtements, nourriture). Utilise le moteur générique existant — un fichier de données + une entrée dans le registre, aucun nouveau composant. Invoque ce skill quand l'utilisateur demande d'ajouter un thème/module/catégorie de vocabulaire anglais.
---

# Ajouter un module « emoji » à English Kids

Ce skill ajoute un thème de vocabulaire (emoji + mot anglais + indice français + quiz) en s'appuyant
sur le **moteur générique** déjà en place (`emoji-learn` / `emoji-game`, routes `/m/:id`). On ne crée
**jamais** de nouveau composant : seulement un fichier de données et une entrée de registre.

L'argument fourni au skill est le **thème** souhaité (ex. `fruits`, `famille`, `vêtements`). S'il manque,
demander lequel.

## Étape 1 — Proposer les items et les FAIRE VALIDER (ne pas créer de fichier avant)

Construire une liste de **5 à 20 items** adaptés à de jeunes enfants. Pour chacun : `emoji`, `word` (anglais),
`fr` (traduction). Contraintes impératives :

- **Emojis sûrs hors-ligne** : n'utiliser que des emojis standard rendus par la police système (Noto sur
  Android). Éviter les emojis très récents, les séquences ZWJ exotiques ou les drapeaux peu courants — s'il
  n'existe pas d'emoji clair et univoque pour un mot, **retirer ce mot** plutôt que forcer un emoji ambigu.
- **Un emoji = un sens clair** pour un enfant (le visuel doit suffire à deviner le mot).
- **Anglais enseigné** : forme de base, minuscule (ex. `apple`, `eat`). FR en minuscule aussi.
- Viser ~8–12 items (qualité > quantité).

Présenter la liste sous forme de tableau (Emoji | word | fr) et **demander validation/ajustements à
l'utilisateur** avant d'écrire quoi que ce soit. Adapter selon son retour.

## Étape 2 — Choisir id, titre, sous-titre, dégradé

- `id` : segment d'URL en minuscules sans accent ni espace (ex. `fruits`, `family`, `clothes`).
  **Vérifier qu'il est unique** (lire `src/app/data/modules.ts`, ne pas dupliquer un `id` existant).
- `title` : nom anglais affiché (ex. `Fruits`). `fr` : sous-titre français (ex. `Les fruits`).
- `tileEmoji` : un emoji représentatif pour la tuile d'accueil.
- `gradient` : un dégradé CSS `linear-gradient(150deg, #XXX, #YYY)` **visuellement distinct** de ceux déjà
  utilisés. Piocher dans la palette du thème (voir `src/styles.scss` : `--c-primary #ff6b6b`,
  `--c-green #2ec27e`, `--c-blue #4dabf7`, `--c-accent #ffd23f`, plus `#ff8e53`, `#ff6fae`, `#8e44ad`).
  Dégradés déjà pris (à ne pas réutiliser tels quels) :
  - numbers `#ff6b6b→#ff8e53` · colors `#4dabf7→#2ec27e`
  - animals `#2ec27e→#ffd23f` · body `#ff8e53→#ff6fae` · actions `#8e44ad→#4dabf7` · weather `#4dabf7→#ffd23f`

## Étape 3 — Créer le fichier de données

Créer `src/app/data/<id>.data.ts` sur le modèle exact des fichiers existants (`animals.data.ts`, etc.) :

```ts
import { EmojiItem } from './emoji-item';

/** <Description FR du thème>, en anglais. */
export const <CONST>: EmojiItem[] = [
  { emoji: '🍎', word: 'apple', fr: 'pomme' },
  // ...
];
```

`<CONST>` = nom en MAJUSCULES (ex. `FRUITS`).

## Étape 4 — Enregistrer le module

Dans `src/app/data/modules.ts` : ajouter l'`import { <CONST> } from './<id>.data';` en haut, puis une
nouvelle entrée dans le tableau `MODULES` :

```ts
{
  id: '<id>',
  title: '<Title>',
  fr: '<Sous-titre FR>',
  tileEmoji: '<emoji>',
  gradient: 'linear-gradient(150deg, #XXX, #YYY)',
  items: <CONST>,
},
```

Rien d'autre n'est à modifier : l'accueil (`home.ts`), les routes `/m/<id>` et `/m/<id>/play` et le quiz
fonctionnent automatiquement.

## Étape 5 — Vérifier le build

Toutes les commandes npm/ng/npx exigent Node 22.22.3 actif (cf. CLAUDE.md). Dans un shell PowerShell :

```powershell
$env:Path = "C:\Users\sebas\AppData\Roaming\nvm\v22.22.3;" + $env:Path
npx ng build
npx cap sync android
```

Vérifier que le build réussit sans erreur. Indiquer à l'utilisateur que le module est testable via
`npx ng serve` → `http://localhost:4201/m/<id>`. **Ne pas committer ni générer d'APK** sauf demande explicite.

## Étape 6 — Mettre à jour le suivi

Ajouter une ligne dans la section « Modules emoji » de `AVANCEMENT.md` (`- [x] Module **<Title>** (…)`).
Ne pas modifier `CLAUDE.md` (la procédure générique y est déjà documentée).
