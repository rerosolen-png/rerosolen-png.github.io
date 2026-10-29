import { getCollection, type CollectionEntry } from 'astro:content';

export type Fabric = CollectionEntry<'tecidos'>;
export type Category = CollectionEntry<'categorias'>;
export type Article = CollectionEntry<'guia'>;

const collator = new Intl.Collator('pt-BR');

/** Todos os tecidos, ordenados por `order` e depois por título. */
export async function getFabrics(): Promise<Fabric[]> {
  const all = await getCollection('tecidos');
  return all.sort(
    (a, b) => a.data.order - b.data.order || collator.compare(a.data.title, b.data.title)
  );
}

/** Todas as categorias, ordenadas por `order`. */
export async function getCategories(): Promise<Category[]> {
  const all = await getCollection('categorias');
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Artigos publicados do guia, do mais recente para o mais antigo. */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('guia');
  return all
    .filter((a) => !a.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Tecidos de uma categoria: primeiro os principais, depois os secundários. */
export function fabricsInCategory(fabrics: Fabric[], categoryId: string): Fabric[] {
  const primary = fabrics.filter((f) => f.data.category === categoryId);
  const secondary = fabrics.filter(
    (f) => f.data.category !== categoryId && f.data.secondaryCategories.includes(categoryId)
  );
  return [...primary, ...secondary];
}

export function categoryMap(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.id, c]));
}

export const fabricUrl = (f: Fabric | string) => `/tecidos/${typeof f === 'string' ? f : f.id}/`;
export const categoryUrl = (c: Category | string) =>
  `/categorias/${typeof c === 'string' ? c : c.id}/`;
export const articleUrl = (a: Article | string) => `/guia/${typeof a === 'string' ? a : a.id}/`;

/** Resolve uma lista de ids de tecidos para entradas existentes (ignora ids inválidos). */
export function resolveFabrics(ids: string[], fabrics: Fabric[]): Fabric[] {
  const byId = new Map(fabrics.map((f) => [f.id, f]));
  return ids.map((id) => byId.get(id)).filter((f): f is Fabric => Boolean(f));
}

export interface ImageCredit {
  title?: string;
  author: string;
  source: string;
  license: string;
  licenseUrl?: string;
  url?: string;
}

/** Créditos de imagens (src/data/image-credits.json), se o arquivo existir. */
export function getImageCredits(): Record<string, ImageCredit> {
  const mods = import.meta.glob<Record<string, ImageCredit>>('../data/image-credits.json', {
    eager: true,
    import: 'default',
  });
  return Object.values(mods)[0] ?? {};
}
