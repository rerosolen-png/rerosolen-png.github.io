#!/usr/bin/env node
/**
 * Otimiza as fotos em src/assets/** para o repositório ficar leve:
 * redimensiona para no máximo 1600 px no lado maior (sem ampliar), remove
 * metadados e grava JPEG progressivo com qualidade 80 (mozjpeg).
 * Só regrava quando o resultado for menor que o original.
 *
 * Uso: npm run images:optimize
 * Rode depois de adicionar fotos novas (próprias ou de bancos de imagens).
 */
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'src/assets');
const MAX = 1600;

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (['.jpg', '.jpeg', '.png'].includes(extname(entry).toLowerCase())) files.push(p);
  }
})(assets);

let before = 0;
let after = 0;
for (const file of files) {
  const input = readFileSync(file);
  before += input.length;
  const meta = await sharp(input).metadata();
  const needsResize = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX;
  const out = await sharp(input)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toBuffer();
  if (out.length < input.length || needsResize) {
    writeFileSync(file, out);
    after += out.length;
    console.log(`[ok] ${file.replace(root, '')}: ${kb(input.length)} → ${kb(out.length)}`);
  } else {
    after += input.length;
  }
}
console.log(`\n${files.length} arquivo(s): ${kb(before)} → ${kb(after)}`);

function kb(n) {
  return `${Math.round(n / 1024)} KB`;
}
