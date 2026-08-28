import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

let index = await readFile('dist/index.html', 'utf8');
const assets = [...new Set(index.match(/\/assets\/[^"']+\.(?:js|css)/g) ?? [])];
const jsAsset = assets.find((asset) => asset.endsWith('.js'));
const cssAsset = assets.find((asset) => asset.endsWith('.css'));
if (!jsAsset || !cssAsset) throw new Error('Could not find built app assets to inline.');
const js = await readFile(`dist${jsAsset}`, 'utf8');
const css = await readFile(`dist${cssAsset}`, 'utf8');
index = index
  .replace(/<script type="module"[^>]+src="[^"]+"><\/script>/, `<script type="module">${js}</script>`)
  .replace(/<link rel="stylesheet"[^>]+>/, `<style>${css}</style>`);
await writeFile('dist/index.html', index);

for (const route of ['privacy', 'terms']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await cp('dist/index.html', `dist/${route}/index.html`);
}

const worker = await readFile('dist/sw.js', 'utf8');
await writeFile('dist/sw.js', worker.replace('/* BUILD_ASSETS */', assets.map((asset) => `'${asset}',`).join(' ')));
