// Génère les sources d'ICÔNE de l'app (Android + web) à partir de la nouvelle icône
// PLEIN CADRE `resources/english_kidz_1024.png` (drapeau + mascottes, bord à bord).
//
// Contrairement à `_gen-icon.mjs` (logo centré sur fond bleu), ici l'icône est une illustration
// carrée complète : on l'utilise TELLE QUELLE, sans la recadrer sur un fond.
//
// Lancer depuis la racine :  node resources/_gen-app-icon.mjs
// puis :  npx @capacitor/assets generate --android --assetPath resources ...
// (voir CLAUDE.md ; on rétablit ensuite le splash + on met l'icône adaptative en plein cadre).
import sharp from 'sharp';

const SRC = 'resources/english_kidz_1024.png';
const SIZE = 1024;

// --- Sources @capacitor/assets (Android) ---
// Icône legacy (carré plein) = l'illustration complète.
await sharp(SRC).resize(SIZE, SIZE).png().toFile('resources/icon-only.png');
console.log('écrit resources/icon-only.png');

// Fond adaptatif = l'illustration complète, bord à bord (le masque système rogne les coins).
await sharp(SRC).resize(SIZE, SIZE).png().toFile('resources/icon-background.png');
console.log('écrit resources/icon-background.png');

// Premier plan adaptatif = transparent : tout le visuel est porté par le fond (plein cadre).
await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .png()
  .toFile('resources/icon-foreground.png');
console.log('écrit resources/icon-foreground.png (transparent)');

// --- Icônes WEB (favicons + manifest PWA), dans public/ ---
// L'illustration a déjà son fond : on redimensionne directement (pas de compositing sur bleu).
const webIcon = async (size, out) => {
  await sharp(SRC).resize(size, size).png().toFile(out);
  console.log('écrit', out);
};
await webIcon(16, 'public/favicon-16.png');
await webIcon(32, 'public/favicon-32.png');
await webIcon(180, 'public/apple-touch-icon.png');
await webIcon(192, 'public/icon-192.png');
await webIcon(512, 'public/icon-512.png');
