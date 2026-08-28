import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

let index = await readFile('dist/index.html', 'utf8');
const assets = [...new Set(index.match(/\/assets\/[^"']+\.(?:js|css)/g) ?? [])];
const jsAsset = assets.find((asset) => asset.endsWith('.js'));
const cssAsset = assets.find((asset) => asset.endsWith('.css'));
if (!jsAsset || !cssAsset) throw new Error('Could not find built app assets to inline.');
const js = await readFile(`dist${jsAsset}`, 'utf8');
const css = await readFile(`dist${cssAsset}`, 'utf8');
const offline = await readFile('dist/offline.html', 'utf8');
const offlineStyle = offline.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
const sha256 = (value) => `'sha256-${createHash('sha256').update(value).digest('base64')}'`;
index = index
  .replace(/<script type="module"[^>]+src="[^"]+"><\/script>/, `<script type="module">${js}</script>`)
  .replace(/<link rel="stylesheet"[^>]+>/, `<style>${css}</style>`);
await writeFile('dist/index.html', index);

const config = {
  routes: [
    { route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    { route: '/icons/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    { route: '/manifest.json', headers: { 'Cache-Control': 'public, max-age=3600, must-revalidate' } },
    { route: '/sw.js', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
    { route: '/', headers: { 'Cache-Control': 'no-cache, must-revalidate' } },
    { route: '/privacy/*', headers: { 'Cache-Control': 'no-cache, must-revalidate' } },
    { route: '/terms/*', headers: { 'Cache-Control': 'no-cache, must-revalidate' } },
  ],
  navigationFallback: {
    rewrite: '/index.html',
    exclude: ['/assets/*', '/icons/*', '/api/*', '/*.{css,js,png,jpg,svg,webp,ico,woff2,json,txt,xml,wasm}'],
  },
  globalHeaders: {
    'Content-Security-Policy': `default-src 'self'; base-uri 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: blob:; manifest-src 'self'; object-src 'none'; script-src 'self' ${sha256(js)}; style-src 'self' ${sha256(css)} ${sha256(offlineStyle)}; worker-src 'self'`,
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  },
};
await writeFile('dist/staticwebapp.config.json', `${JSON.stringify(config, null, 2)}\n`);

for (const route of ['privacy', 'terms']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await cp('dist/index.html', `dist/${route}/index.html`);
}

const worker = await readFile('dist/sw.js', 'utf8');
await writeFile('dist/sw.js', worker.replace('/* BUILD_ASSETS */', assets.map((asset) => `'${asset}',`).join(' ')));
