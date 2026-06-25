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
- [ ] (Option) Plus de catégories (lettres, animaux, formes…), suivi des scores
