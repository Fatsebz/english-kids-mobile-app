// Génère l'icône de splash Android 12+ (logo English Kidz haute résolution, fond transparent).
// Évite le flou : le logo remplit largement le canevas, puis le système le réduit (net) au lieu
// de fortement agrandir le petit logo du premier plan adaptatif.
// Lancer depuis la racine : `node resources/_gen-splash-icon.mjs`
import sharp from 'sharp';

const LOGO = 'public/englishkidz.webp';
const SIZE = 1152; // canevas recommandé pour windowSplashScreenAnimatedIcon
// Le splash Android 12+ masque l'icône à un cercle (≈ 2/3 du canevas, soit ~768 px de diamètre).
// Le logo (3:2) doit tenir DANS ce cercle (diagonale ≤ ~720 px), sinon il est rogné sur les bords.
// 0.5 → largeur ~576 px, diagonale ~692 px : entièrement visible, centré.
const LOGO_FRAC = 0.5;
const OUT = 'android/app/src/main/res/drawable-nodpi/splash_icon.png';

const logo = await sharp(LOGO)
  .resize({ width: Math.round(SIZE * LOGO_FRAC) })
  .png()
  .toBuffer();

await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: logo, gravity: 'center' }])
  .png()
  .toFile(OUT);

console.log('écrit', OUT);
