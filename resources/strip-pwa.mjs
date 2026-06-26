// Retire les assets PWA/web du build avant `cap sync` : ils ne servent qu'au navigateur
// (favicon, manifest, icônes PWA) et sont inutiles dans la WebView Android → APK plus léger.
// Lancer depuis la racine, ENTRE `ng build` et `cap sync` : `node resources/strip-pwa.mjs`
import { unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist/english-kidz/browser';
const PWA_ONLY = [
  'favicon-16.png',
  'favicon-32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'manifest.webmanifest',
];

let removed = 0;
for (const name of PWA_ONLY) {
  const p = join(DIST, name);
  try {
    const { size } = await stat(p);
    await unlink(p);
    console.log(`retiré ${name} (${(size / 1024).toFixed(1)} Ko)`);
    removed++;
  } catch {
    /* absent : rien à faire */
  }
}
console.log(`strip-pwa : ${removed} fichier(s) retiré(s) de l'APK.`);
