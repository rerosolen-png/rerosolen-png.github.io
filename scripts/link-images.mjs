#!/usr/bin/env node
/**
 * Vincula fotos ao conteúdo.
 *
 * Para cada arquivo Markdown em src/content/{tecidos,categorias,guia} que ainda
 * não tem o campo `image`, procura uma foto com o mesmo slug em
 * src/assets/<coleção>/<slug>.jpg e, se existir, insere no frontmatter:
 *   image, imageAlt e (quando houver crédito em src/data/image-credits.json) imageCredit.
 *
 * Uso: npm run images:link
 * Idempotente: arquivos que já têm `image:` são ignorados.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const creditsPath = join(root, 'src/data/image-credits.json');
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, 'utf8')) : {};

const collections = [
  { name: 'tecidos', alt: (t) => `Tecido ${t}: foto ilustrativa da textura e do caimento` },
  { name: 'categorias', alt: (t) => `${t}: foto ilustrativa` },
  { name: 'guia', alt: (t) => `${t}: imagem ilustrativa` },
];

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

let linked = 0;
for (const col of collections) {
  const dir = join(root, 'src/content', col.name);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const slug = file.replace(/\.md$/, '');
    const asset = join(root, 'src/assets', col.name, `${slug}.jpg`);
    if (!existsSync(asset)) continue;

    const path = join(dir, file);
    const src = readFileSync(path, 'utf8');
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) {
      console.warn(`[skip] ${col.name}/${file}: frontmatter não encontrado`);
      continue;
    }
    const title = (fm[1].match(/^title:\s*['"]?(.+?)['"]?\s*$/m) ?? [])[1] ?? slug;
    const credit = credits[`${col.name}/${slug}`];
    const creditLines = credit
      ? [
          'imageCredit:',
          `  author: ${q(credit.author ?? 'Desconhecido')}`,
          `  source: ${q(credit.source ?? '')}`,
          `  license: ${q(credit.license ?? '')}`,
          ...(credit.url ? [`  url: ${q(credit.url)}`] : []),
          ...(credit.authorUrl ? [`  authorUrl: ${q(credit.authorUrl)}`] : []),
          ...(credit.sourceUrl ? [`  sourceUrl: ${q(credit.sourceUrl)}`] : []),
        ]
      : [];

    if (/^image:/m.test(fm[1])) {
      // Já vinculado: só sincroniza o bloco imageCredit com src/data/image-credits.json
      // (necessário quando a foto é trocada por outra de autor/licença diferentes).
      if (!credit) continue;
      const block = fm[1].match(/^imageCredit:\n(?:[ \t]+.*\n?)*/m);
      const current = block ? block[0].replace(/\n$/, '') : null;
      const next = creditLines.join('\n');
      if (current === next) continue;
      const newFm = current ? fm[1].replace(current, next) : `${fm[1]}\n${next}`;
      writeFileSync(path, src.replace(fm[0], `---\n${newFm}\n---`), 'utf8');
      linked++;
      console.log(`[crédito] ${col.name}/${slug}`);
      continue;
    }

    const lines = [
      `image: ../../assets/${col.name}/${slug}.jpg`,
      `imageAlt: ${q(col.alt(title))}`,
      ...creditLines,
    ];

    const updated = src.replace(fm[0], `---\n${fm[1]}\n${lines.join('\n')}\n---`);
    writeFileSync(path, updated, 'utf8');
    linked++;
    console.log(`[ok] ${col.name}/${slug}${credit ? ' (+crédito)' : ''}`);
  }
}
console.log(`\n${linked} arquivo(s) atualizado(s).`);
