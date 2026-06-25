# Avancement — English Kids

Suivi des tâches du projet. ☑ = fait · ☐ = à faire

## Mise en place
- [x] Vérifier l'environnement (Node, JDK, Android SDK/Studio)
- [x] Installer un Node compatible (22.22.3 via nvm) — Angular CLI 22 exige ≥ 22.22.3
- [x] Scaffolder le projet **Angular 22** (standalone, SCSS, routing)
- [x] Installer **Capacitor 8** + `@capacitor/android`
- [x] Installer plugins : `@capacitor-community/text-to-speech` (TTS), `canvas-confetti`, `@fontsource/fredoka`
- [x] `npx cap init` (appId `com.keyconsulting.englishkids`, webDir `dist/english-kids/browser`)

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
- [x] Accueil : tuiles générées depuis `MODULES`, grille 2 colonnes défilante

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
