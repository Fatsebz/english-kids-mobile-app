# Avancement — English Kids

Suivi des tâches du projet. ☑ = fait · ☐ = à faire

## Mise en place
- [x] Vérifier l'environnement (Node, JDK, Android SDK/Studio)
- [x] Installer un Node compatible (22.22.3 via nvm) — Angular CLI 22 exige ≥ 22.22.3
- [x] Scaffolder le projet **Angular 22** (standalone, SCSS, routing)
- [x] Installer **Capacitor 8** + `@capacitor/android`
- [x] Installer plugins : `@capacitor-community/text-to-speech` (TTS), `canvas-confetti`, `@fontsource/fredoka`
- [x] `npx cap init` (appId `com.fatsebz.englishkids`, webDir `dist/english-kids/browser`)

## UI & socle
- [x] Thème enfant global (`styles.scss`) : couleurs vives, gros boutons ≥ 72px, police Fredoka locale, animations (pop/bounce/shake)
- [x] `index.html` portrait (viewport, theme-color, lang=fr)
- [x] Shell + routes (lazy `loadComponent`)
- [x] Données : `numbers.data.ts` (1–20), `colors.data.ts` (11 couleurs)
- [x] `AudioService` : TTS natif Capacitor + repli Web Speech API
- [x] `quiz-engine` : génération question (cible + 3 distracteurs mélangés)
- [x] `CelebrationComponent` : confettis + message animé

## Module Numbers
- [x] Écran **Apprendre** : grille 1–20, tap → chiffre + mot anglais + audio
- [x] Mini-jeu : chiffre affiché, 4 choix (mots anglais), bonne réponse → célébration, mauvaise → secousse
- [x] Compteur d'étoiles

## Module Colors
- [x] Écran **Apprendre** : pastilles de couleur, tap → nom anglais (+ indice FR) + audio
- [x] Mini-jeu : pastille affichée, 4 noms anglais, célébration / secousse
- [x] Compteur d'étoiles

## Modules « emoji » (génériques, pilotés par les données)
- [x] Moteur générique : `EmojiItem`, registre `modules.ts`, pages `EmojiLearn` / `EmojiGame` (routes `/m/:id`)
- [x] Module **Animals** (animaux de la ferme, 12 éléments)
- [x] Module **Body** (parties du corps, 10 éléments)
- [x] Module **Actions** (verbes courants, 12 éléments)
- [x] Module **Weather** (météo, 10 éléments)
- [x] Module **Fruits** (12 éléments)
- [x] Module **Vegetables** (légumes, 12 éléments)
- [x] Module **Food** (nourriture, 12 éléments)
- [x] Module **Family** (famille, 7 éléments)
- [x] Module **Clothes** (vêtements, 10 éléments)
- [x] Module **Shapes** (formes, 6 éléments)
- [x] Module **Letters** (alphabet A–Z ; visuel = majuscule, indice = minuscule)
- [x] Module **Transport** (12), **Fairy tale** (10), **Jobs** (10), **Zoo** (12), **Sports** (10)
- [x] Module **Christmas** (8), **Tableware** (8), **School** (10), **House** (10), **Beach** (10)
- [x] Modules **Days** (7) & **Months** (12) : visuel = numéro, `listen: false` (incompatibles mode écoute)
- [x] Module **Instruments** (10 instruments de musique)
- [x] Flag `listen` par module : pas de mode écoute si non supporté ; thème masqué si profil en écoute seule
- [x] Accueil : tuiles générées depuis `MODULES`, grille 2 colonnes défilante

## Profils & progression
- [x] **Profils personnalisables** : créer / renommer / supprimer (prénom ≤ 20 + avatar Vico/Bille), liste persistée `ek.profiles` ; création depuis « Qui joue ? » (si liste vide) ou les Réglages ; restauration de sauvegarde avec **remappage des id de profil**
- [x] **Profils enfants** : écran de sélection `/profiles`, avatars dans `public/profiles/` (320 px)
- [x] `ProfileService` : profil courant persisté (`ek.profile`), `profileGuard` redirige vers `/profiles` si aucun
- [x] Bandeau permanent en haut (avatar + prénom, tap → changer de profil)
- [x] `ProgressService` : progression **par profil** persistée (`ek.progress.<id>`), réactive (signal)
- [x] Registre unifié `themes.ts` (Numbers + Colors + modules emoji) pour étoiles/grand test génériques
- [x] **3 étoiles par thème** sur les cartes d'accueil (≥1 / moitié / tous les éléments distincts réussis)
- [x] Jeux : enregistrement des bonnes réponses (`recordCorrect`)
- [x] **Grand test** générique `/test/:id` (débloqué à 3 ⭐) : tous les éléments sans erreur, sinon retour au début
- [x] Grand test réussi → **coupe 🏆** qui remplace les 3 étoiles sur la carte

## Modes de quiz, sélection & réglages
- [x] **Sélection intelligente** des questions (`pickTarget`) : priorité aux éléments non maîtrisés / non encore proposés → 3 ⭐ atteignables
- [x] **Quiz générique** unifié `/quiz/:id/:mode` (remplace les 3 composants `*-game`)
- [x] Mode **`read`** : visuel → choisir le mot (lecteurs)
- [x] Mode **`listen`** : 🔊 prononce → choisir l'image (non-lecteurs)
- [x] Progression **partagée** entre les deux modes
- [x] **Admin** (3e carte ⚙️, PIN défaut `1234`) : thèmes affichés + modes par enfant, réinitialisation (profil / thème)
- [x] **Vitesse de la voix par profil** (slider 50–100 %, défaut 90 %) + bouton de test dans l'Admin
- [x] Accueil et page *Apprendre* filtrés selon les réglages du profil
- [x] Réglages en **liste noire** : tout thème (existant/futur) visible par défaut, l'Admin masque
- [x] **Alerte voix indisponible** : bannière si aucune voix anglaise (TTS natif ou Web Speech)
- [x] **Sauvegarde / Restauration** de la progression (export/import JSON) dans l'Admin
- [x] **Tests unitaires** (Vitest) : `quiz-engine` (pickTarget/choicesFor), `ProgressService`, `SettingsService`
- [x] **Feedback immédiat des étoiles** : célébration spéciale + fanfare quand un palier (1/2/3 ⭐) est franchi en quiz
- [x] À la 3ᵉ étoile : redirection vers la page du thème (boutons grand test disponibles)
- [x] **Icônes SVG bundlées** (`img` sur un item) pour les concepts sans emoji clair : `fork`, `eraser`, `table`, `witch` (sorcière entière), `plate` (assiette seule), `sea`, `sand`, `goldfish`, `parakeet`
- [x] Module **Pets** (animaux domestiques) + **Farm** renommé ; **Forest** (forêt) ; **Insects** (insectes) ; **Seasons** (saisons)
- [x] Module **Time** (unités de temps, kind `word` : visuel = mot FR, lecture seule)
- [x] **Groupes de thèmes** (`groups.ts`) : Animaux / Concepts / Temps / Nourriture → sous-écran `/g/:id` ; tuile réutilisable `theme-tile`
- [x] **Thèmes de révision dynamiques** : ❓ Tout (tous les éléments activés) et 🏆 Champions (thèmes avec coupe) — quiz mixte sans étoiles ni grand test (`aggregate.ts`, `AggregateService`, `/review/:id`)
- [x] Rendu **par kind d'élément** (chiffres/couleurs/emojis/mots mélangeables dans un même quiz)

## Android / Build
- [x] `ng build` OK (sortie `dist/english-kids/browser`)
- [x] Vérifier 100 % hors-ligne (police bundlée, aucune URL distante)
- [x] `npx cap add android`
- [x] Orientation **portrait** verrouillée dans le manifest
- [x] **APK debug généré** : `android/app/build/outputs/apk/debug/app-debug.apk` (~4,2 Mo)
- [x] Documentation : `CLAUDE.md`, `AVANCEMENT.md`

## Reste à faire / pistes (optionnel)
- [ ] Tester l'APK sur un appareil réel : audio TTS natif, orientation, navigation
- [ ] Installer la voix anglaise (en-US) sur l'appareil pour l'audio hors-ligne
- [x] Icône et splash personnalisés (`@capacitor/assets`) — source `resources/`, fond bleu ciel
- [ ] (Option) APK **release signé** pour distribution (keystore)
- [ ] (Option) Audio `.mp3` pré-enregistré si garantie « zéro dépendance TTS système »
- [ ] (Option) Encore plus de catégories (lettres, formes, fruits, famille…), suivi des scores persistant
