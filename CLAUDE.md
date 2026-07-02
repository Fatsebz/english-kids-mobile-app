# English Kidz 🎈

Application mobile **Android** ludique pour enfants : apprendre l'anglais (**nombres de 1 à 20** et **couleurs**).
Développée en **Angular 22** + **Capacitor 8**, packagée en **APK**. **100 % hors-ligne, aucun backend.**

---

## Prérequis (machine de dev)

| Outil | Version requise | Notes |
|-------|-----------------|-------|
| Node.js | **≥ 22.22.3** (ou 24.15+ / 26+) | Angular CLI 22 refuse Node < 22.22.3 |
| npm | ≥ 10 | fourni avec Node 22 |
| JDK | **21** (obligatoire) | Capacitor 8 (`capacitor-android`) exige *source release 21* — JDK 17 échoue (`invalid source release: 21`). Installé : `C:\Program Files\Java\jdk-21.0.2` |
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
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.2"   # JDK 21 requis (le JBR d'Android Studio convient aussi s'il est en 21)
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
npx ng build         # sortie : dist/english-kidz/browser
```

### Synchroniser avec Capacitor (après chaque build web)
```powershell
npm run sync:android   # = ng build + strip-pwa + cap sync android
```
> `sync:android` lance `resources/strip-pwa.mjs` **entre** le build et le sync : ce script retire de
> `dist/` les assets purement web (favicons, `manifest.webmanifest`, `icon-192/512`, `apple-touch-icon`)
> qui ne servent qu'au navigateur et alourdiraient inutilement l'APK (ils restent dans `public/` pour le
> mode navigateur). Ne pas utiliser `npx cap sync` seul si on veut un APK allégé.

### Ouvrir dans Android Studio
```powershell
npx cap open android
```
Puis bouton ▶️ « Run » sur un appareil/émulateur.

### Générer l'APK en ligne de commande (debug)
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.2"   # JDK 21 requis (le JBR d'Android Studio convient aussi s'il est en 21)
cd android
.\gradlew.bat assembleDebug
```
APK produit ici :
```
android/app/build/outputs/apk/debug/app-debug.apk
```
Installer sur un appareil : `adb install -r app-debug.apk` (ou copier le fichier sur le téléphone et l'ouvrir).

### APK release signé (optionnel, pour distribution)
1. Créer un keystore : `keytool -genkey -v -keystore english-kidz.keystore -alias key0 -keyalg RSA -keysize 2048 -validity 10000`
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
    │   ├── profile.service.ts   liste de profils (CRUD, ek.profiles) + profil courant (ek.profile)
    │   ├── progress.service.ts  progression PAR PROFIL (étoiles, grand test) + reset (ek.progress.<id>)
    │   ├── settings.service.ts  réglages PAR ENFANT (thèmes/modes affichés) + PIN admin (ek.settings.<id>)
    │   └── profile.guard.ts     redirige vers /profiles si aucun profil sélectionné
    ├── data/
    │   ├── numbers.data.ts      1..20 + mot anglais
    │   ├── colors.data.ts       11 couleurs (name EN, fr, hex)
    │   ├── emoji-item.ts        interface EmojiItem { emoji? | img?, word (EN), fr } (img = SVG bundlé)
    │   ├── animals/body/…       11 fichiers <thème>.data.ts (EmojiItem[])
    │   ├── modules.ts           registre MODULES + findModule() (kind 'emoji' | 'word')
    │   ├── themes.ts            registre UNIFIÉ THEMES (numbers+colors+emoji+word) → accueil, quiz, grand test
    │   └── groups.ts            GROUPS : regroupe des thèmes (Animals, Concepts, Time) → sous-écran /g/:id
    ├── shared/
    │   ├── quiz-engine.ts       shuffle, buildQuestion, pickTarget (priorité non-maîtrisés), choicesFor
    │   ├── celebration/         overlay confettis + message + fanfare (canvas-confetti / Web Audio)
    │   ├── profile-header/      bandeau permanent (avatar + prénom + drapeau UK), tap → /profiles
    │   ├── audio-warning/       bannière si voix anglaise indisponible
    │   ├── theme-tile/          tuile d'un thème (visuel + étoiles/coupe), réutilisée accueil + groupe
    │   └── play-buttons/        boutons des modes activés (read/listen) + 🏆 grand test (par mode)
    └── pages/
        ├── profiles/            sélection du profil (+ création si liste vide, carte ⚙️ Réglages)
        ├── admin/               réglages (PIN) : thèmes/modes/vitesse par enfant, reset, sauvegarde
        ├── home/                tuiles de GROUPES + thèmes isolés (filtrés par réglages)
        ├── group/               GÉNÉRIQUE /g/:id : liste les thèmes d'un groupe
        ├── numbers-learn / colors-learn / emoji-learn : écrans « Apprendre »
        ├── quiz/                GÉNÉRIQUE /quiz/:id/:mode (read | listen), tous kinds
        └── grand-test/          GÉNÉRIQUE /test/:id/:mode : tous les éléments sans erreur → coupe
```

### Routes
`/profiles` · `/admin` · `/` · `/g/:id` (groupe) · `/numbers` · `/colors` · `/m/:id`
· `/quiz/:id/:mode` (`read` | `listen`) · `/test/:id/:mode` (grand test)
Toutes les routes de **contenu** sont protégées par `profileGuard` ; `/profiles` et `/admin` ne le sont pas.

### Groupes & types de thème
- **Groupes** (`data/groups.ts`) : quand plusieurs thèmes vont ensemble (Animaux : Farm/Pets/Zoo/Forest ;
  Concepts : Numbers/Letters/Shapes ; Temps : Days/Months/Time/Seasons), l'accueil affiche une **tuile de
  groupe** → sous-écran `/g/:id`. Les thèmes hors groupe restent en tuiles directes.
- **Kind `word`** (module `kind: 'word'`, ex. *Time*) : pas d'emoji, le **visuel = mot français** et l'enfant
  choisit le mot anglais (traduction). Toujours `listen: false`.

### Profils, progression & réglages
- **Profils** : `ProfileService` gère une **liste dynamique** de profils (créés par le parent) persistée
  dans `localStorage` (`ek.profiles`, signal) + le profil courant (`ek.profile`). **Aucun profil par défaut** :
  au premier lancement la liste est vide et l'écran « Qui joue ? » ne propose que **➕ Nouveau profil**
  (le bouton n'apparaît que si la liste est vide ; ensuite l'ajout se fait dans les Réglages). Avatars
  `public/profiles/*.png` (palette `AVATARS`). CRUD : `addProfile`/`renameProfile`/`removeProfile` +
  `createWithId` (restauration, conserve un id). Création (prénom ≤ 20 + avatar) via le composant partagé
  `shared/profile-editor`. Bandeau `profile-header` toujours visible (tap → changer). La **restauration**
  (`admin`) propose un **remappage** des id de profil de la sauvegarde vers les profils existants (ou les
  recrée en conservant l'id) ; les id legacy `vico`/`bille` restent reconnus pour la rétro-compat.
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

> **Concept sans emoji clair (ou ambigu)** : un item peut utiliser `img: 'icons/<nom>.svg'` (au lieu de
> `emoji`) avec un SVG bundlé dans `public/icons/`. Rendu partout (apprentissage, quiz, grand test),
> 100 % hors-ligne. Exemples fournis : `fork`, `eraser`, `table`, `witch` (distincte du `wizard` emoji).

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
L'**icône = illustration carrée PLEIN CADRE** (drapeau UK + deux mascottes, bord à bord ;
source `resources/english_kidz_1024.png`, 1024²). Elle est utilisée **telle quelle** (plus de « logo
centré sur bleu »). Deux scripts pilotent la génération :

- `resources/_gen-app-icon.mjs` → sources `@capacitor/assets` (`icon-only`, `icon-background`,
  `icon-foreground`) **et** les **favicons / icônes web** dans `public/` (`favicon-16/32.png`,
  `apple-touch-icon.png`, `icon-192/512.png`) — ces dernières retirées de l'APK au build (`strip-pwa`).
- `resources/_gen-android-launcher.mjs` → écrit **directement** les icônes de lanceur Android nettes,
  en plein cadre (voir plus bas). À lancer **après** `@capacitor/assets`.

| Fichier source (`resources/`) | Rôle |
|------|------|
| `english_kidz_1024.png` | **source unique de l'icône** (illustration plein cadre) |
| `icon-only.png` | icône legacy (= illustration) |
| `icon-foreground.png` | premier plan adaptatif (**transparent** : tout le visuel est dans le fond) |
| `icon-background.png` | fond adaptatif (= illustration, plein cadre) |
| `splash.png`, `splash-dark.png` | **bleu uni** (plus d'illustration plein écran) |

> **Icône adaptative en plein cadre & nette** : `@capacitor/assets` 3.0.5 génère les calques adaptatifs
> à la résolution *legacy* (48 px en mdpi) + un inset 16,7 % → un plein-cadre serait **flou** et laisserait
> des coins transparents. D'où `_gen-android-launcher.mjs` : il réécrit les `mipmap-*/ic_launcher*` à leur
> **vraie taille** (108 dp : 108→432 px), met le drapeau **bord à bord** (`background` = illustration,
> `foreground` = transparent) et réécrit les `mipmap-anydpi-v26/ic_launcher*.xml` **sans inset**. Le masque
> système (cercle/rond) rogne les coins ; les mascottes centrées restent visibles.

Régénérer l'icône (Android + web) :
```powershell
# 1) sources @capacitor/assets + icônes web, depuis resources/english_kidz_1024.png :
node resources/_gen-app-icon.mjs
# 2) ressources Android (icônes + splash) — RECRÉE le splash plein écran, à nettoyer après :
npx @capacitor/assets generate --android --assetPath resources `
  --iconBackgroundColor "#6a8dff" --iconBackgroundColorDark "#455ca6" `
  --splashBackgroundColor "#6a8dff" --splashBackgroundColorDark "#455ca6"
# 3) supprimer les splash plein écran recréés (garde l'APK allégé) :
git clean -fd android/app/src/main/res
# 4) icônes de lanceur nettes en plein cadre (écrase la sortie basse résolution de @capacitor/assets) :
node resources/_gen-android-launcher.mjs
```
> **Plus de splash plein écran** (gain APK ~10 Mo) : tous les `drawable*/splash.png` sont supprimés et le
> thème de lancement `AppTheme.NoActionBarLaunch` (`res/values/styles.xml`) utilise un **fond bleu uni**
> (`@color/splashBackground`, défini dans `res/values/colors.xml`) + `windowSplashScreenAnimatedIcon`
> (l'icône). Sur **Android 12+**, le système affiche l'icône centrée sur ce fond. Après chaque
> régénération `@capacitor/assets`, **réappliquer** ces deux points (le générateur réécrit `styles.xml`
> vers `@drawable/splash` et recrée les `drawable-land*` / `splash.png`).

> **Icône de splash nette** : `windowSplashScreenAnimatedIcon` pointe vers `@drawable/splash_icon`
> (`res/drawable-nodpi/splash_icon.png`, 1152², logo ~70 % du canevas) et **pas** vers le premier plan
> adaptatif `ic_launcher_foreground` (dont le logo, trop petit, était fortement agrandi par le système →
> splash flou). Régénérer avec `node resources/_gen-splash-icon.mjs`. À réappliquer aussi après une
> régénération `@capacitor/assets`.

## Versionnage & changelog
- **Source unique** : `src/app/data/changelog.ts` (`APP_VERSION` + `CHANGELOG`). Affiché dans l'écran
  **⚙️ Réglages** (section « À propos » + version sur l'écran de code).
- **Publier une version** :
  1. Ajouter une entrée **en tête** de `CHANGELOG` (`{ version, date, changes[] }`) et mettre à jour `APP_VERSION`.
  2. Aligner `android/app/build.gradle` : `versionName` = `APP_VERSION`, **incrémenter** `versionCode` (entier).
  3. Aligner `package.json` (`version`).
  4. `npx ng build ; npx cap sync android`, puis APK.
- Versionnage **sémantique** (MAJ.MIN.CORR). `versionCode` doit toujours augmenter pour une mise à jour Android.

## Notes techniques
- Angular 22 : composants **standalone**, **signals**, control flow `@if`/`@for`. Fichiers nommés
  `app.ts`, `home.ts`, etc. (nouvelle convention, sans suffixe `.component`).
- `webDir` (capacitor.config.ts) = `dist/english-kidz/browser` (sortie du builder `@angular/build:application`).
- Orientation **portrait** verrouillée dans `AndroidManifest.xml` (`android:screenOrientation="portrait"`).
- appId : `com.fatsebz.englishkidz` — nom : **English Kidz**.

Voir **AVANCEMENT.md** pour le suivi des tâches.
