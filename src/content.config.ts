import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Créditos de imagem (obrigatórios para fotos de bancos com licença Creative Commons). */
const imageCredit = z.object({
  author: z.string(),
  source: z.string(),
  license: z.string(),
  url: z.string().url().optional(),
});

const faqItem = z.object({ question: z.string(), answer: z.string() });

/**
 * Tecidos: uma página por produto (src/content/tecidos/<slug>.md).
 * O `id` da entrada (nome do arquivo sem extensão) vira a URL /tecidos/<slug>/.
 */
const tecidos = defineCollection({
  loader: glob({ base: './src/content/tecidos', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Título curto para cards e menus. */
      shortName: z.string().optional(),
      /** Título da aba/SERP, se diferente do title. Máx. ~60 caracteres. */
      seoTitle: z.string().max(70).optional(),
      /** Meta description. Entre 120 e 165 caracteres. */
      description: z.string().min(50).max(170),
      /** id da categoria principal (src/content/categorias). */
      category: z.string(),
      /** Categorias secundárias, para aparecer em mais de uma listagem. */
      secondaryCategories: z.array(z.string()).default([]),
      composition: z.string(),
      width: z.string(),
      weight: z.string().optional(),
      elasticity: z.string().optional(),
      transparency: z.string().optional(),
      touch: z.string().optional(),
      uses: z.array(z.string()).min(1),
      characteristics: z.array(z.string()).default([]),
      care: z.array(z.string()).default([]),
      colors: z.string().optional(),
      keywords: z.array(z.string()).default([]),
      /** ids de tecidos relacionados (links internos). */
      related: z.array(z.string()).default([]),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: imageCredit.optional(),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      updatedDate: z.coerce.date().optional(),
      faq: z.array(faqItem).default([]),
    }),
});

/** Categorias de tecidos (moda, decoração, festa...). URL: /categorias/<slug>/. */
const categorias = defineCollection({
  loader: glob({ base: './src/content/categorias', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortName: z.string().optional(),
      seoTitle: z.string().max(70).optional(),
      description: z.string().min(50).max(170),
      intro: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: imageCredit.optional(),
      keywords: z.array(z.string()).default([]),
      order: z.number().default(100),
      faq: z.array(faqItem).default([]),
    }),
});

/** Guia de tecidos: artigos informativos (blog). URL: /guia/<slug>/. */
const guia = defineCollection({
  loader: glob({ base: './src/content/guia', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string().max(70).optional(),
      description: z.string().min(50).max(170),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: imageCredit.optional(),
      tags: z.array(z.string()).default([]),
      /** ids de tecidos citados, para links internos. */
      relatedFabrics: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { tecidos, categorias, guia };
