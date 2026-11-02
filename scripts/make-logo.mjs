#!/usr/bin/env node
/**
 * Gera os arquivos do logotipo da Rosolen Têxtil em vetor.
 *
 * O logotipo oficial usa a fonte Brush Script MT (círculo azul-marinho com o "R"
 * e o nome "Rosolen Têxtil"). Este script converte o texto em caminhos SVG com a
 * própria fonte, para o logo ficar nítido em qualquer tamanho e não depender da
 * fonte instalada no computador do visitante.
 *
 * Saída (em public/):
 *   logo.svg            logo horizontal, azul-marinho (cabeçalho)
 *   logo-light.svg      versão branca, para fundos escuros (rodapé)
 *   favicon.svg         só a marca (círculo com o R)
 *   favicon.ico         16, 32 e 48 px
 *   apple-touch-icon.png (180 px), icon-192.png, icon-512.png
 *
 * Uso: npm run logo [-- caminho/para/BRUSHSCI.TTF]
 * No Windows a fonte fica em C:\Windows\Fonts\BRUSHSCI.TTF. Rode `npm run og`
 * depois, para a imagem de compartilhamento usar o logo novo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const fontPath = process.argv[2] ?? 'C:/Windows/Fonts/BRUSHSCI.TTF';

const NAVY = '#000033';
const WHITE = '#ffffff';

const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
console.log(`Fonte: ${font.names.fullName?.en ?? fontPath}`);

/** Caminho do texto já ajustado para uma altura visual alvo. */
function textPath(text, targetHeight) {
  const probe = font.getPath(text, 0, 0, 100, { kerning: true }).getBoundingBox();
  const size = (100 * targetHeight) / (probe.y2 - probe.y1);
  const path = font.getPath(text, 0, 0, size, { kerning: true });
  return { path, box: path.getBoundingBox(), size };
}

const r = (n) => Number(n.toFixed(2));

/* ---------- Marca: círculo com o R ---------- */
const D = 160; // diâmetro do círculo nas unidades do SVG
const mark = textPath('R', D * 0.68);
// Centraliza o R no círculo (deslocando levemente para a esquerda, como no original).
const markDx = D / 2 - (mark.box.x1 + mark.box.x2) / 2 - D * 0.03;
const markDy = D / 2 - (mark.box.y1 + mark.box.y2) / 2;

function markSvg({ bg, fg }) {
  return (
    `<circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="${bg}"/>` +
    `<path transform="translate(${r(markDx)} ${r(markDy)})" fill="${fg}" d="${mark.path.toPathData(2)}"/>`
  );
}

/* ---------- Nome ---------- */
const word = textPath('Rosolen Têxtil', D * 0.62);
const GAP = D * 0.17;
const wordDx = D + GAP - word.box.x1;
const wordDy = D / 2 - (word.box.y1 + word.box.y2) / 2 + D * 0.02;

const totalW = D + GAP + (word.box.x2 - word.box.x1);
const PAD = 2;

function logoSvg({ bg, fg, text }) {
  const w = r(totalW + PAD * 2);
  const h = r(D + PAD * 2);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Rosolen Têxtil">` +
    `<title>Rosolen Têxtil</title>` +
    `<g transform="translate(${PAD} ${PAD})">` +
    markSvg({ bg, fg }) +
    `<path transform="translate(${r(wordDx)} ${r(wordDy)})" fill="${text}" d="${word.path.toPathData(2)}"/>` +
    `</g></svg>\n`
  );
}

writeFileSync(join(pub, 'logo.svg'), logoSvg({ bg: NAVY, fg: WHITE, text: NAVY }));
writeFileSync(join(pub, 'logo-light.svg'), logoSvg({ bg: WHITE, fg: NAVY, text: WHITE }));

/* ---------- Favicon SVG (só a marca) ---------- */
const favicon =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${D} ${D}" width="${D}" height="${D}">` +
  markSvg({ bg: NAVY, fg: WHITE }) +
  `</svg>\n`;
writeFileSync(join(pub, 'favicon.svg'), favicon);

/* ---------- Ícones PNG: quadrado azul-marinho com o R branco ---------- */
function iconSvg(side) {
  const scale = (side / D) * 0.86; // R um pouco maior, sem o círculo
  const inner = textPath('R', D * 0.68);
  const dx =
    (side - (inner.box.x2 - inner.box.x1) * scale) / 2 - inner.box.x1 * scale - side * 0.02;
  const dy = (side - (inner.box.y2 - inner.box.y1) * scale) / 2 - inner.box.y1 * scale;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">` +
      `<rect width="${side}" height="${side}" fill="${NAVY}"/>` +
      `<path transform="translate(${r(dx)} ${r(dy)}) scale(${r(scale)})" fill="${WHITE}" d="${inner.path.toPathData(2)}"/>` +
      `</svg>`
  );
}

const png = (side) => sharp(iconSvg(side)).png({ compressionLevel: 9 }).toBuffer();

await sharp(await png(180)).toFile(join(pub, 'apple-touch-icon.png'));
await sharp(await png(192)).toFile(join(pub, 'icon-192.png'));
await sharp(await png(512)).toFile(join(pub, 'icon-512.png'));
writeFileSync(
  join(pub, 'favicon.ico'),
  await pngToIco([await png(16), await png(32), await png(48)])
);

console.log(
  `[ok] logo.svg (${r(totalW)}x${D}), logo-light.svg, favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png`
);
