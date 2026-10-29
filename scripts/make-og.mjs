#!/usr/bin/env node
/**
 * Gera public/og-default.jpg (1200x630), a imagem usada quando um link do site
 * é compartilhado no WhatsApp, Facebook, Instagram ou Google.
 *
 * Se existir src/assets/hero.jpg, usa a foto como fundo com uma faixa escura e
 * o nome da loja; caso contrário, gera uma arte só com as cores da marca.
 *
 * Uso: npm run og
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hero = join(root, 'src/assets/hero.jpg');
const out = join(root, 'public/og-default.jpg');
const W = 1200;
const H = 630;

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#15283f" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#15283f" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g transform="translate(80 330)">
    <rect x="0" y="0" width="92" height="92" rx="20" fill="#ffffff" opacity="0.12"/>
    <path transform="translate(4 4) scale(1.75)" fill="#ffffff"
      d="M12 36V12h11.5c5 0 8.5 2.8 8.5 7.2 0 3.3-2 5.7-5.2 6.6L34 36h-5.6l-6.3-9.3h-5V36H12zm5.1-13.6h5.9c2.8 0 4.4-1.3 4.4-3.3s-1.6-3.3-4.4-3.3h-5.9v6.6z"/>
    <text x="120" y="52" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="700" fill="#ffffff">Rosolen Têxtil</text>
    <text x="122" y="100" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#f3c7b3" letter-spacing="2">LOJA DE TECIDOS EM RIBEIRÃO PRETO DESDE 1995</text>
    <text x="122" y="150" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#d8e0ec">Tecidos planos e malhas por metro · Av. da Saudade, 891 · (16) 3961-3969</text>
  </g>
</svg>`);

const base = existsSync(hero)
  ? sharp(hero).resize(W, H, { fit: 'cover', position: 'centre' })
  : sharp({
      create: { width: W, height: H, channels: 3, background: '#1f3a5f' },
    });

await base
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(out);

console.log(`[ok] ${out} (${existsSync(hero) ? 'com foto do hero' : 'arte da marca'})`);
