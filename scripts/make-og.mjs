#!/usr/bin/env node
/**
 * Gera public/og-default.jpg (1200x630), a imagem usada quando um link do site
 * é compartilhado no WhatsApp, Facebook, Instagram ou Google.
 *
 * Usa o logotipo oficial (public/logo-light.svg, gerado por `npm run logo`)
 * sobre a foto src/assets/hero.jpg com uma faixa escura; sem a foto, gera uma
 * arte só com as cores da marca.
 *
 * Uso: npm run og
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hero = join(root, 'src/assets/hero.jpg');
const logo = join(root, 'public/logo-light.svg');
const out = join(root, 'public/og-default.jpg');
const W = 1200;
const H = 630;
const NAVY = '#000033';

if (!existsSync(logo)) {
  console.error('public/logo-light.svg não encontrado. Rode `npm run logo` antes.');
  process.exit(1);
}

const logoPng = await sharp(logo).resize({ width: 560 }).png().toBuffer();
const { height: logoH = 108 } = await sharp(logoPng).metadata();
const logoTop = 300;
const logoLeft = 80;
const textTop = logoTop + logoH + 56;

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}" stop-opacity="0.2"/>
      <stop offset="0.45" stop-color="${NAVY}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${NAVY}" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="${logoLeft + 4}" y="${textTop}" font-family="'Segoe UI', Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#f3c7b3" letter-spacing="3">LOJA DE TECIDOS EM RIBEIRÃO PRETO DESDE 1995</text>
  <text x="${logoLeft + 4}" y="${textTop + 48}" font-family="'Segoe UI', Arial, Helvetica, sans-serif" font-size="27" fill="#d8dcee">Tecidos planos e malhas por metro · Av. da Saudade, 891 · (16) 3961-3969</text>
</svg>`);

const base = existsSync(hero)
  ? sharp(hero).resize(W, H, { fit: 'cover', position: 'centre' })
  : sharp({ create: { width: W, height: H, channels: 3, background: NAVY } });

await base
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logoPng, top: logoTop, left: logoLeft },
  ])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(out);

console.log(`[ok] ${out} (${existsSync(hero) ? 'com foto do hero' : 'arte da marca'})`);
