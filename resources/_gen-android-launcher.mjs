// Génère les icônes de lanceur Android EN PLEIN CADRE à partir de l'illustration carrée
// `resources/english_kidz_1024.png`, aux bonnes résolutions (crisp).
//
// Pourquoi ce script en plus de @capacitor/assets : la v3.0.5 génère les calques adaptatifs à la
// résolution LEGACY (48 px en mdpi) puis compense par un inset 16,7 % → un plein-cadre serait flou.
// Ici on écrit les calques adaptatifs à leur vraie taille (108 dp) et on met le drapeau BORD À BORD :
//   - background = illustration complète (remplit tout le calque, le masque système rogne les coins)
//   - foreground = transparent (tout le visuel est dans le fond)
//   - ic_launcher.png (legacy carré) = illustration
//   - ic_launcher_round.png (legacy rond) = illustration masquée en cercle
//
// Lancer depuis la racine :  node resources/_gen-android-launcher.mjs
import sharp from 'sharp';

const SRC = 'resources/english_kidz_1024.png';
const RES = 'android/app/src/main/res';

// { dossier : { legacy (icône 48 dp), adaptive (calque 108 dp) } }
const DENSITIES = {
  ldpi: { legacy: 36, adaptive: 81 },
  mdpi: { legacy: 48, adaptive: 108 },
  hdpi: { legacy: 72, adaptive: 162 },
  xhdpi: { legacy: 96, adaptive: 216 },
  xxhdpi: { legacy: 144, adaptive: 324 },
  xxxhdpi: { legacy: 192, adaptive: 432 },
};

// Zone de sécurité des icônes adaptatives : ~2/3 du canevas seulement est garanti visible (le système
// masque en cercle/rond et rogne le tiers extérieur). L'illustration est donc réduite à SAFE du canevas
// et centrée ; le bord (rogné) est comblé par une COPIE FLOUE du même drapeau → le drapeau atteint quand
// même les bords (pas de trou ni de liseré), et les mascottes restent entières.
const SAFE = 0.8;
// Les mascottes sont plus longues vers le bas (pieds) : on décale l'illustration vers le HAUT
// (fraction du canevas) pour que les pieds entrent dans le cercle sans rogner les têtes.
const SHIFT_UP = 0.06;

const square = (size) => sharp(SRC).resize(size, size).png().toBuffer();

// Illustration réduite (SAFE), décalée vers le haut, sur un fond = drapeau flouté plein cadre.
const composed = async (size) => {
  const inner = Math.round(size * SAFE);
  const left = Math.round((size - inner) / 2);
  const top = Math.round((size - inner) / 2 - size * SHIFT_UP);
  const bg = await sharp(SRC).resize(size, size, { fit: 'cover' }).blur(Math.max(1, size / 18)).toBuffer();
  const fg = await sharp(SRC).resize(inner, inner).toBuffer();
  return sharp(bg).composite([{ input: fg, top, left }]).png().toBuffer();
};

const circleMasked = async (buf, size) => {
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
  return sharp(buf).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
};

const transparent = (size) =>
  sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .png()
    .toBuffer();

for (const [d, { legacy, adaptive }] of Object.entries(DENSITIES)) {
  const dir = `${RES}/mipmap-${d}`;
  // Icône legacy carrée (Android < 8, non masquée) : illustration plein cadre nette.
  await sharp(await square(legacy)).toFile(`${dir}/ic_launcher.png`);
  // Icône ronde + fond adaptatif : version réduite (mascottes entières après masque).
  await sharp(await circleMasked(await composed(legacy), legacy)).toFile(`${dir}/ic_launcher_round.png`);
  await sharp(await composed(adaptive)).toFile(`${dir}/ic_launcher_background.png`);
  await sharp(await transparent(adaptive)).toFile(`${dir}/ic_launcher_foreground.png`);
  console.log('écrit', dir, `(legacy ${legacy}, adaptive ${adaptive})`);
}

// Calques adaptatifs BORD À BORD (pas d'inset : le drapeau remplit tout, masqué à la forme système).
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
for (const name of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
  await sharp; // no-op pour garder l'import en tête
  const { writeFile } = await import('node:fs/promises');
  await writeFile(`${RES}/mipmap-anydpi-v26/${name}`, adaptiveXml, 'utf8');
  console.log('écrit', `${RES}/mipmap-anydpi-v26/${name}`);
}
