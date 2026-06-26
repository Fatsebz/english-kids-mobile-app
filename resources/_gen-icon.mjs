// Génère les sources d'icône/splash English Kidz : logo centré sur fond uni.
// Lancer depuis la racine du projet : `node resources/_gen-icon.mjs`
// puis : npx @capacitor/assets generate --android --assetPath resources --iconBackgroundColor "#6a8dff" ...
import sharp from 'sharp';

const LOGO = 'public/englishkidz.webp';
const SIZE = 1024;
const BG = { r: 0x6a, g: 0x8d, b: 0xff }; // #6a8dff (haut du dégradé du thème, derrière le logo)
const BG_DARK = { r: 0x45, g: 0x5c, b: 0xa6 }; // #455ca6 (variante sombre)

const bg = (color, alpha = 1) => ({
  create: { width: SIZE, height: SIZE, channels: 4, background: { ...color, alpha } },
});

const logoAt = (widthFrac) =>
  sharp(LOGO).resize({ width: Math.round(SIZE * widthFrac) }).png().toBuffer();

const compose = async (baseSpec, logoBuf, out) => {
  await sharp(baseSpec).composite([{ input: logoBuf, gravity: 'center' }]).png().toFile(out);
  console.log('écrit', out);
};

// Icône legacy (carré plein) : logo ~78 % sur violet.
await compose(bg(BG), await logoAt(0.78), 'resources/icon-only.png');
// Premier plan adaptatif : logo ~72 % sur transparent (le générateur ajoute l'inset 16,7 %).
await compose(bg(BG, 0), await logoAt(0.72), 'resources/icon-foreground.png');
// Fond adaptatif : violet uni.
await sharp(bg(BG)).png().toFile('resources/icon-background.png');
console.log('écrit resources/icon-background.png');

// Splash : violet uni (plus d'illustration), 2732².
const splash = (color, f) =>
  sharp({ create: { width: 2732, height: 2732, channels: 4, background: { ...color, alpha: 1 } } })
    .png()
    .toFile(f)
    .then(() => console.log('écrit', f));
await splash(BG, 'resources/splash.png');
await splash(BG_DARK, 'resources/splash-dark.png');

// --- Icônes WEB (favicons + manifest), logo sur violet, dans public/ ---
// Restent dans public/ pour le navigateur mais sont retirées de l'APK (voir resources/strip-pwa.mjs).
const webIcon = async (size, out) => {
  const logo = await sharp(LOGO).resize({ width: Math.round(size * 0.84) }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { ...BG, alpha: 1 } } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(out);
  console.log('écrit', out);
};
await webIcon(16, 'public/favicon-16.png');
await webIcon(32, 'public/favicon-32.png');
await webIcon(180, 'public/apple-touch-icon.png');
await webIcon(192, 'public/icon-192.png');
await webIcon(512, 'public/icon-512.png');
