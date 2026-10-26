import { access, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const paths = new Set([
  '/qr/', '/qr/index.html', '/qr/code.svg', '/qr/manifest.webmanifest',
  '/qr/icons/icon-192.png', '/qr/icons/icon-512.png',
  '/qr/icons/maskable-512.png', '/qr/icons/apple-touch-icon.png',
]);
if (await access('dist/images/profile.jpg').then(() => true, () => false)) paths.add('/images/profile.jpg');
const visited = new Set();
function include(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const entry = manifest[key];
  if (!entry) throw new Error(`Missing QR build dependency ${key}`);
  paths.add('/' + entry.file);
  for (const file of [...(entry.css ?? []), ...(entry.assets ?? [])]) paths.add('/' + file);
  for (const dependency of entry.imports ?? []) include(dependency);
}
include('qr/index.html');
const precache = [...paths].sort();
const hash = createHash('sha256');
// Worker logic changes must also create an isolated version, even when assets are identical.
hash.update(await readFile(import.meta.filename));
for (const url of precache) {
  hash.update(url);
  hash.update(await readFile(url === '/qr/' ? 'dist/qr/index.html' : 'dist' + url));
}
const version = hash.digest('hex').slice(0, 20);
const worker = `// Generated from all QR dependency bytes. Do not edit dist directly.
const CACHE_PREFIX = 'gabriel-qr-';
const CACHE_NAME = CACHE_PREFIX + '${version}';
const PRECACHE = ${JSON.stringify(precache, null, 2)};
const KNOWN = new Set(PRECACHE);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })));
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isCard = request.mode === 'navigate' && (url.pathname === '/qr/' || url.pathname === '/qr/index.html');
  // Never intercept root navigation or arbitrary URLs, even from a controlled card.
  if (request.mode === 'navigate' && !isCard) return;
  const key = isCard ? '/qr/' : url.pathname + url.search;
  if (!KNOWN.has(key)) return;
  event.respondWith((async () => {
    const response = await (await caches.open(CACHE_NAME)).match(key);
    return response || fetch(request);
  })());
});
`;
await writeFile('dist/qr/sw.js', worker);
console.log(`Generated QR worker ${version}, ${precache.length} local resources.`);
