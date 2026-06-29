# Idées d'amélioration — week-end

Suivi des idées proposées et de leur avancement.
☐ à faire · 🔧 en cours · ☑ fait

---

## 1. Réorganiser les Réglages (séparation visuelle profil / général)
**Statut : ☑**
Écran ⚙️ Réglages scindé en deux groupes titrés : **👤 Réglages de l'enfant** (onglet enfant +
thèmes, modes, vitesse, choix de la voix, réinitialisation) et **🛠️ Réglages généraux** (profils,
code parent, sauvegarde, liste des éléments, à propos). Barres d'en-tête `.group-head`.

## 2. Case à cocher « je sais lire » sur le profil
**Statut : ☑**
Booléen `canRead` ajouté au `Profile` + case dans le `profile-editor` (défaut coché ; rétro-compat :
profils existants = lecteurs).

## 3. Masquage des thèmes « texte » si profil ne sait pas lire
**Statut : ☑**
Décision retenue : masquage au **niveau thème** (plus simple, cohérent avec les réglages existants).
Un thème « texte » = `listen: false` (l'heure, jours, mois — visuel = mot, pas d'image distincte).
Si `canRead === false`, ces thèmes sont masqués. Logique centralisée dans
`SettingsService.isThemeVisibleForCurrent()` (accueil + groupes refactorés dessus).

## 4. Nouveau thème « Games » (jeux)
**Statut : ☑**
`games.data.ts` : dice 🎲, cards 🃏, chess ♟️, puzzle 🧩, video game 🎮, darts 🎯, kite 🪁,
teddy bear 🧸, heart ♥️, spade ♠️, club ♣️, diamond ♦️ (12).

## 5. Nouveau thème « Rooms » (pièces de la maison)
**Statut : ☑**
`rooms.data.ts` : kitchen 🍳, bedroom 🛏️, bathroom 🛁, living room 🛋️, dining room 🍽️,
garage 🚗, garden 🌳, office 💻 (8). Distinct du thème « House » (= mobilier).

## 6. Splash flou → à revoir
**Statut : ☑ (à vérifier sur appareil)**
Cause : `windowSplashScreenAnimatedIcon` pointait vers le premier plan adaptatif (logo trop petit,
agrandi par Android → flou). Corrigé : icône dédiée HD `drawable-nodpi/splash_icon.png` (1152², logo
~70 %) générée par `resources/_gen-splash-icon.mjs` ; `styles.xml` pointe désormais dessus.
→ Reste à valider visuellement sur un appareil/émulateur Android 12+.

## 7. Mode entraînement : bouton FR (drapeau français) + UK (union jack)
**Statut : ☑**
Composant partagé `shared/say-flags` : bouton gauche fond **drapeau FR** (lit le mot en français,
`AudioService.speakFr`), bouton droit fond **union jack** (lit en anglais). Intégré dans
`emoji-learn`, `numbers-learn`, `colors-learn`. `AudioService.speak` accepte désormais une `lang`.

## 8. Options de voix (homme/femme, anglais/américain)
**Statut : ☑ (à vérifier sur appareil)**
`AudioService` liste les voix anglaises de l'appareil (`getSupportedVoices` natif / `getVoices` web).
Choix **par profil** persisté (`voiceUri` dans `ek.settings.<id>`), appliqué à la prononciation
anglaise. Sélecteur + bouton de test dans Réglages (« Choix de la voix »).
→ Les voix réellement disponibles (et donc le couple homme/femme GB/US) dépendent de l'appareil ;
à vérifier sur cible.

## 9. Switch pour retirer la protection par code parental
**Statut : ☑**
Interrupteur « 🔒 Protéger les réglages par un code » dans la section Code parent
(`SettingsService.pinEnabled` / `ek.adminPinEnabled`). Désactivé → l'écran Réglages s'ouvre
directement (pas de pavé PIN).

## 10. Liste complète des éléments par thème (dans les réglages)
**Statut : ☑**
Section « 📋 Liste des éléments » (Réglages généraux) : tous les thèmes et leurs éléments
(visuel + mot EN + traduction FR). `ThemeEntry` enrichi d'un champ `fr`.

---

## Reste à faire avant publication
- [ ] Vérifier sur appareil : splash net (#6), voix homme/femme GB/US disponibles (#8), audio FR (#7).
- [ ] Publier une version : entrée `CHANGELOG` + `APP_VERSION`, `versionName`/`versionCode`
      (`android/app/build.gradle`), `package.json`, puis `npm run sync:android` + APK.
