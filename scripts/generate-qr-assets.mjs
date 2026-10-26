import QRCode from 'qrcode';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { qrTarget } from '../src/data/qr.ts';

await mkdir('public/qr/icons', { recursive: true });
await writeFile('public/qr/code.svg', await QRCode.toString(qrTarget, {
  type: 'svg', errorCorrectionLevel: 'M', margin: 4,
  color: { dark: '#000000', light: '#ffffff' },
}));
// Original monogram artwork, centered within the maskable icon safe circle.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#0a1512"/>
<circle cx="256" cy="256" r="176" fill="#1c2e28" stroke="#f0c060" stroke-width="8"/>
<path d="M248 220c-9-12-22-18-38-18-32 0-54 23-54 55s22 55 54 55c15 0 28-4 39-12v-43h-40M358 220c-9-12-22-18-38-18-32 0-54 23-54 55s22 55 54 55c16 0 29-6 38-18" fill="none" stroke="#eef4ef" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['maskable-512', 512], ['apple-touch-icon', 180]]) {
  await sharp(Buffer.from(icon)).resize(size, size).png().toFile(`public/qr/icons/${name}.png`);
}
console.log('Generated local QR and PWA icons.');
