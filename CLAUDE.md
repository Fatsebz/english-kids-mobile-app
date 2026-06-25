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
    ├── app.ts / app.routes.ts  shell + routes (lazy loadComponent)
    ├── core/audio.service.ts   prononciation : TTS natif (Capacitor) | Web Speech (navigateur)
    ├── data/
    │   ├── numbers.data.ts      1..20 + mot anglais
    │   └── colors.data.ts       11 couleurs (name EN, fr, hex)
    ├── shared/
    │   ├── quiz-engine.ts       buildQuestion() : cible + 3 distracteurs mélangés
    │   └── celebration/         overlay confettis + message (canvas-confetti)
    └── pages/
        ├── home/                menu : Numbers / Colors
        ├── numbers-learn/       grille 1..20, tap → chiffre + mot + audio
        ├── numbers-game/        quiz : chiffre affiché, 4 mots, célébration
        ├── colors-learn/        pastilles + nom + audio
        └── colors-game/         quiz : pastille affichée, 4 noms, célébration
```

### Routes
`/` · `/numbers` · `/numbers/play` · `/colors` · `/colors/play`

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
