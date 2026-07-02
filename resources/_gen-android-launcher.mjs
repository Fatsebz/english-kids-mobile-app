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

const square = (size) => sharp(SRC).resize(size, size).png().toBuffer();

const circleMasked = async (size) => {
  const base = await square(size);
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
  return sharp(base).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
};

const transparent = (size) =>
  sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .png()
    .toBuffer();

for (const [d, { legacy, adaptive }] of Object.entries(DENSITIES)) {
  const dir = `${RES}/mipmap-${d}`;
  await sharp(await square(legacy)).toFile(`${dir}/ic_launcher.png`);
  await sharp(await circleMasked(legacy)).toFile(`${dir}/ic_launcher_round.png`);
  await sharp(await square(adaptive)).toFile(`${dir}/ic_launcher_background.png`); // plein cadre
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
