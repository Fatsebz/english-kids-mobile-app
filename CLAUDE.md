# English Kids 🎈

Application mobile **Android** ludique pour enfants : apprendre l'anglais (**nombres de 1 à 20** et **couleurs**).
Développée en **Angular 22** + **Capacitor 8**, packagée en **APK**. **100 % hors-ligne, aucun backend.**

---

## Prérequis (machine de dev)

| Outil | Version requise | Notes |
|-------|-----------------|-------|
| Node.js | **≥ 22.22.3** (ou 24.15+ / 26+) | Angular CLI 22 refuse Node < 22.22.3 |
| npm | ≥ 10 | fourni avec Node 22 |
| JDK | **17 ou 21** | celui d'Android Studio (`…\Android Studio\jbr`) convient |
| Android SDK | platform 35/36, build-tools 35+ | installé via Android Studio |
| Android Studio | Ladybug+ | pour ouvrir/déboguer le projet natif |

### ⚠️ Spécificité de cette machine (nvm-windows)
La version Node par défaut est trop ancienne. Node **22.22.3** est installé via nvm mais
`nvm use` exige les **droits administrateur** (modifie un lien symbolique dans `C:\Program Files\nodejs`).

- **Solution simple** : ouvrir un terminal **en administrateur** puis `nvm use 22.22.3`.
- **Sans admin** (pour un terminal ponctuel), préfixer le PATH vers le binaire Node :
  ```powershell
  $env:Path = "C:\Users\sebas\AppData\Roaming\nvm\v22.22.3;" + $env:Path
  node --version   # doit afficher v22.22.3
  ```

Pour les commandes Gradle, définir le JDK :
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

---

## Commandes

> Toutes les commandes supposent Node 22.22.3 actif (voir ci-dessus).

### Développement (navigateur)
```powershell
npm start            # ou: npx ng serve  →  http://localhost:4200
```
En navigateur, l'audio utilise la **Web Speech API**. Sur appareil Android, c'est le **TTS natif**.

### Build web
```powershell
npx ng build         # sortie : dist/english-kids/browser
```

### Synchroniser avec Capacitor (après chaque build web)
```powershell
npx ng build ; npx cap sync android
```

### Ouvrir dans Android Studio
```powershell
npx cap open android
```
Puis bouton ▶️ « Run » sur un appareil/émulateur.

### Générer l'APK en ligne de commande (debug)
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd android
.\gradlew.bat assembleDebug
```
APK produit ici :
```
android/app/build/outputs/apk/debug/app-debug.apk
```
Installer sur un appareil : `adb install -r app-debug.apk` (ou copier le fichier sur le téléphone et l'ouvrir).

### APK release signé (optionnel, pour distribution)
1. Créer un keystore : `keytool -genkey -v -keystore english-kids.keystore -alias key0 -keyalg RSA -keysize 2048 -validity 10000`
2. Renseigner `signingConfigs` dans `android/app/build.gradle`.
3. `.\gradlew.bat assembleRelease` → `app-release.apk`.

---

## Architecture

```
src/
├── index.html                 viewport portrait, theme-color, lang=fr
├── styles.scss                thème (couleurs vives), gros boutons, police Fredoka, animations
└── app/
    ├── app.ts / app.routes.ts  shell (bandeau profil + router-outlet) + routes (lazy, profileGuard)
    ├── core/
    │   ├── audio.service.ts     prononciation : TTS natif (Capacitor) | Web Speech (navigateur)
    │   ├── profile.service.ts   profil courant (Vico/Bille), persisté localStorage (ek.profile)
    │   ├── progress.service.ts  progression PAR PROFIL (étoiles, grand test) + reset (ek.progress.<id>)
    │   ├── settings.service.ts  réglages PAR ENFANT (thèmes/modes affichés) + PIN admin (ek.settings.<id>)
    │   └── profile.guard.ts     redirige vers /profiles si aucun profil sélectionné
    ├── data/
    │   ├── numbers.data.ts      1..20 + mot anglais
    │   ├── colors.data.ts       11 couleurs (name EN, fr, hex)
    │   ├── emoji-item.ts        interface EmojiItem { emoji, word (EN), fr }
    │   ├── animals/body/…       11 fichiers <thème>.data.ts (EmojiItem[])
    │   ├── modules.ts           registre MODULES + findModule() (pilote les modules emoji)
    │   └── themes.ts            registre UNIFIÉ THEMES (numbers+colors+emoji) → accueil, quiz, grand test
    ├── shared/
    │   ├── quiz-engine.ts       shuffle, buildQuestion, pickTarget (priorité non-maîtrisés), choicesFor
    │   ├── celebration/         overlay confettis + message (canvas-confetti, générique)
    │   ├── profile-header/      bandeau permanent (avatar + prénom), tap → /profiles
    │   └── play-buttons/        boutons des modes activés (read/listen) + 🏆 grand test
    └── pages/
        ├── profiles/            sélection du profil (Vico / Bille + carte ⚙️ Réglages)
        ├── admin/               réglages (PIN) : thèmes/modes par enfant + réinitialisation
        ├── home/                tuiles (THEMES filtrés par réglages) + 3 étoiles / coupe par carte
        ├── numbers-learn/       module Numbers (stage + grille + <app-play-buttons>)
        ├── colors-learn/        module Colors
        ├── emoji-learn/         GÉNÉRIQUE : tout module /m/:id
        ├── quiz/                GÉNÉRIQUE /quiz/:id/:mode (read | listen), tous kinds
        └── grand-test/          GÉNÉRIQUE /test/:id : tous les éléments sans erreur → coupe
```

### Routes
`/profiles` (sélection) · `/admin` (réglages, PIN) · `/` · `/numbers` · `/colors` · `/m/:id`
· `/quiz/:id/:mode` (mode = `read` | `listen`) · `/test/:id` (grand test)
Toutes les routes de **contenu** sont protégées par `profileGuard` ; `/profiles` et `/admin` ne le sont pas.

### Profils, progression & réglages
- **Profils** : `ProfileService` gère le profil courant (Vico/Bille, avatars `public/profiles/*.png`),
  persisté dans `localStorage` (`ek.profile`). Bandeau `profile-header` toujours visible (tap → changer).
- **Progression par profil** : `ProgressService` (signal réactif) stocke `ek.progress.<profileId>` =
  `{ [themeId]: { mastered: string[], champion: bool } }`. Le quiz appelle `recordCorrect(themeId, key)`
  sur chaque bonne réponse (clé d'élément, **partagée entre les deux modes**). `resetProfile`/`resetTheme` pour l'admin.
- **Étoiles** : `stars(themeId, total)` → 0..3 (seuils : ≥1 / `ceil(total/2)` / `total` éléments distincts).
- **Grand test** (`/test/:id`, débloqué à 3 ⭐) : enchaîner **tous** les éléments du thème sans erreur ;
  une faute → retour au 1er. Réussi → `setChampion()` → **coupe 🏆** à la place des étoiles sur la carte.
- **Sélection des questions** : `pickTarget()` priorise les éléments **non maîtrisés** puis **non encore
  proposés** dans la session → on atteint les 3 ⭐ sans retomber sans cesse sur les mêmes.
- **Deux modes de quiz** : `read` (visuel → choisir le mot) et `listen` (🔊 prononce → choisir l'image,
  pour les non-lecteurs). Le composant `quiz` gère les deux pour tous les `kind` (number/color/emoji).
- **Réglages (admin, PIN)** : `SettingsService` stocke par enfant `ek.settings.<id> = { themes, modes }`
  (défaut : tout activé). L'accueil et `play-buttons` filtrent selon ces réglages. PIN dans `ek.adminPin`
  (défaut `1234`, modifiable dans l'écran Admin).

### Modules « emoji » génériques
Les modules **Animals / Body / Actions / Weather** ne sont **pas** des composants dédiés : ils sont
pilotés par les données. Une seule paire de composants (`emoji-learn`, `emoji-game`) lit l'`id` de
l'URL (`/m/:id`), résout le module via `findModule(id)` (dans `data/modules.ts`) et affiche ses
`EmojiItem[]`. `quiz-engine` et `celebration` sont génériques et réutilisés tels quels.

**Ajouter un nouveau module emoji** (≈ 2 min, aucun nouveau composant) :
1. Créer `src/app/data/<theme>.data.ts` exportant un `EmojiItem[]` (`{ emoji, word, fr }`).
2. Ajouter une entrée dans `MODULES` (`src/app/data/modules.ts`) : `{ id, title, fr, tileEmoji, gradient, items }`.
3. C'est tout — `themes.ts` l'agrège, la tuile d'accueil, la route `/m/<id>`, les quiz `/quiz/<id>/:mode` et le grand test fonctionnent automatiquement.

> Les emojis sont rendus par la police emoji du système (Noto sur Android) : **aucune ressource distante**,
> compatible 100 % hors-ligne. Si un glyphe manque sur un vieil appareil, remplacer l'emoji dans le `.data.ts`.

---

## Contrainte 100 % hors-ligne
- **Aucune ressource distante** : la police (Fredoka) est auto-hébergée via `@fontsource/fredoka` et
  bundlée (`.woff2`) ; `canvas-confetti` est bundlé ; aucun CDN ni appel réseau.
- **Audio** : repose sur le **moteur de synthèse vocale du téléphone**. Pour que l'anglais soit prononcé
  hors connexion, la voix **anglaise (en-US)** doit être installée :
  *Réglages Android → Gestion générale → Synthèse vocale → installer / télécharger la voix anglaise.*
- La permission `INTERNET` reste dans le manifest (standard Capacitor) mais l'app ne contacte aucun serveur.
- Pour une garantie « zéro dépendance au TTS système » : remplacer `AudioService` par des fichiers
  `.mp3` pré-enregistrés placés dans `public/audio/`.

---

## Icône & splash screen
Les images source sont dans **`resources/`** et les ressources Android sont générées avec
**`@capacitor/assets`** (fond **bleu ciel #AEEEFA**, assorti à l'illustration) :

| Fichier source (`resources/`) | Rôle |
|------|------|
| `Bicon_1024.png` | image fournie (icône carrée 1024²) |
| `icon-only.png`, `icon-foreground.png` | icône (legacy + premier plan adaptatif) |
| `icon-background.png` | fond adaptatif (bleu ciel uni) |
| `splash.png`, `splash-dark.png` | splash 2732² (illustration centrée sur fond uni) |

Régénérer après modification d'une image source :
```powershell
npx @capacitor/assets generate --android --assetPath resources \
  --iconBackgroundColor "#AEEEFA" --iconBackgroundColorDark "#1B2A4A" \
  --splashBackgroundColor "#AEEEFA" --splashBackgroundColorDark "#1B2A4A"
```
> L'app étant verrouillée en portrait, les variantes `drawable-land*` générées sont supprimées
> (inutiles) pour alléger l'APK. Sur **Android 12+**, l'écran de démarrage système affiche l'icône
> centrée sur le fond ; le splash plein-écran s'affiche via `@drawable/splash`.

## Notes techniques
- Angular 22 : composants **standalone**, **signals**, control flow `@if`/`@for`. Fichiers nommés
  `app.ts`, `home.ts`, etc. (nouvelle convention, sans suffixe `.component`).
- `webDir` (capacitor.config.ts) = `dist/english-kids/browser` (sortie du builder `@angular/build:application`).
- Orientation **portrait** verrouillée dans `AndroidManifest.xml` (`android:screenOrientation="portrait"`).
- appId : `com.keyconsulting.englishkids` — nom : **English Kids**.

Voir **AVANCEMENT.md** pour le suivi des tâches.
