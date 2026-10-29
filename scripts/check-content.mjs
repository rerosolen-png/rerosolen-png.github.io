#!/usr/bin/env node
/**
 * Validação de conteúdo (roda no `npm run lint` e no CI).
 *
 * Verifica, em src/content/{tecidos,categorias,guia}:
 *   - frontmatter YAML válido e campos essenciais
 *   - description com tamanho adequado para SEO (120–165 caracteres)
 *   - seoTitle com até 60 caracteres
 *   - category / secondaryCategories apontando para categorias existentes
 *   - related / relatedFabrics apontando para tecidos existentes
 *   - links internos (/tecidos/x/, /categorias/x/, /guia/x/) que existem
 *   - ausência de termos proibidos (preços, nome de site concorrente)
 *   - tamanho mínimo do texto
 *
 * Erros (exit 1): quebram o build. Avisos: só informam.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src/content');

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

function load(collection) {
  const dir = join(contentDir, collection);
  if (!existsSync(dir)) return new Map();
  const entries = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const id = file.replace(/\.md$/, '');
    const raw = readFileSync(join(dir, file), 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    const label = `${collection}/${file}`;
    if (!m) {
      err(label, 'frontmatter não encontrado');
      continue;
    }
    let data;
    try {
      data = YAML.parse(m[1]);
    } catch (e) {
      err(label, `YAML inválido: ${e.message.split('\n')[0]}`);
      continue;
    }
    entries.set(id, { id, label, data: data ?? {}, body: m[2] ?? '' });
  }
  return entries;
}

const tecidos = load('tecidos');
const categorias = load('categorias');
const guia = load('guia');

const FORBIDDEN = [
  { re: /lojadetecidos/i, msg: 'menciona lojadetecidos.com.br' },
  { re: /R\$\s?\d/, msg: 'contém preço (R$)' },
];

const linkRe = /\]\(\/(tecidos|categorias|guia)\/([a-z0-9-]+)\/?\)/g;
function checkLinks(entry) {
  for (const m of entry.body.matchAll(linkRe)) {
    const [, type, slug] = m;
    const map = type === 'tecidos' ? tecidos : type === 'categorias' ? categorias : guia;
    if (!map.has(slug)) err(entry.label, `link interno quebrado: /${type}/${slug}/`);
  }
}

function checkCommon(entry, { minWords }) {
  const { data, body, label } = entry;
  if (!data.title) err(label, 'sem title');
  if (typeof data.description !== 'string') err(label, 'sem description');
  else {
    const len = data.description.length;
    if (len < 50 || len > 170) err(label, `description com ${len} caracteres (schema: 50–170)`);
    else if (len < 120 || len > 165)
      warn(label, `description com ${len} caracteres (ideal 120–165)`);
  }
  if (data.seoTitle && data.seoTitle.length > 60)
    warn(label, `seoTitle com ${data.seoTitle.length} caracteres (ideal até 60)`);
  for (const f of FORBIDDEN) {
    if (f.re.test(body) || f.re.test(JSON.stringify(data))) err(label, f.msg);
  }
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < minWords) warn(label, `texto curto (${words} palavras, mínimo sugerido ${minWords})`);
  checkLinks(entry);
}

for (const t of tecidos.values()) {
  checkCommon(t, { minWords: 350 });
  const { data, label } = t;
  if (!categorias.has(data.category)) err(label, `category inexistente: ${data.category}`);
  for (const c of data.secondaryCategories ?? [])
    if (!categorias.has(c)) err(label, `secondaryCategory inexistente: ${c}`);
  for (const r of data.related ?? []) {
    if (!tecidos.has(r)) err(label, `related inexistente: ${r}`);
    if (r === t.id) warn(label, 'related aponta para o próprio tecido');
  }
  if (!Array.isArray(data.uses) || data.uses.length === 0) err(label, 'uses vazio');
  if (!Array.isArray(data.faq) || data.faq.length < 3) warn(label, 'faq com menos de 3 perguntas');
  if (data.image && !existsSync(join(contentDir, 'tecidos', data.image)))
    err(label, `imagem não encontrada: ${data.image}`);
}

for (const c of categorias.values()) {
  checkCommon(c, { minWords: 250 });
  if (!c.data.intro) err(c.label, 'sem intro');
  if (c.data.image && !existsSync(join(contentDir, 'categorias', c.data.image)))
    err(c.label, `imagem não encontrada: ${c.data.image}`);
}

for (const g of guia.values()) {
  checkCommon(g, { minWords: 600 });
  for (const r of g.data.relatedFabrics ?? [])
    if (!tecidos.has(r)) err(g.label, `relatedFabrics inexistente: ${r}`);
  if (g.data.image && !existsSync(join(contentDir, 'guia', g.data.image)))
    err(g.label, `imagem não encontrada: ${g.data.image}`);
}

// Títulos duplicados entre tecidos confundem o Google.
const titles = new Map();
for (const t of tecidos.values()) {
  const key = (t.data.title ?? '').toLowerCase();
  if (titles.has(key)) warn(t.label, `title duplicado com ${titles.get(key)}`);
  else titles.set(key, t.label);
}

console.log(
  `Conteúdo: ${tecidos.size} tecidos, ${categorias.size} categorias, ${guia.size} artigos.`
);
if (warnings.length) {
  console.log(`\nAvisos (${warnings.length}):`);
  for (const w of warnings) console.log(`  - ${w}`);
}
if (errors.length) {
  console.error(`\nErros (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\nSem erros.');
