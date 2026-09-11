import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sourceDirectory = fileURLToPath(new URL('../source-images/', import.meta.url));
const outputDirectory = fileURLToPath(new URL('../public/images/heroes/', import.meta.url));
const images = [
  { name: 'deepiq-hero', width: 1717 },
  { name: 'cloudmon-observability-hero', width: 1956 },
  { name: 'miphi-storage-hero', width: 1942 },
];

await mkdir(outputDirectory, { recursive: true });

for (const { name, width: originalWidth } of images) {
  const widths = [640, 1280, originalWidth];
  const source = join(sourceDirectory, `${name}.png`);

  for (const width of widths) {
    const pipeline = sharp(source).resize({ width, withoutEnlargement: true });
    await Promise.all([
      pipeline
        .clone()
        .avif({ quality: 52, effort: 6 })
        .toFile(join(outputDirectory, `${name}-${width}.avif`)),
      pipeline
        .clone()
        .webp({ quality: 74, smartSubsample: true })
        .toFile(join(outputDirectory, `${name}-${width}.webp`)),
    ]);
  }
}

console.log(`Generated responsive AVIF and WebP variants for ${images.length} hero images.`);
