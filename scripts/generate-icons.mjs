import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const srcSvg = path.join(root, 'public', 'firstclass-logo.svg');
const outDir = path.join(root, 'public');

async function main() {
  const svg = await readFile(srcSvg);

  const tasks = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
  ].map(async ({ size, name }) => {
    const outPath = path.join(outDir, name);
    await sharp(svg)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`Wrote ${name}`);
  });

  await Promise.all(tasks);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

