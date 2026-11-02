// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Configuração do Astro.
 *
 * - `site` é obrigatório para gerar URLs canônicas e o sitemap.
 *   Troque pelo domínio definitivo quando ele estiver no ar.
 * - `trailingSlash: 'always'` + `build.format: 'directory'` geram URLs
 *   estáveis (ex.: /tecidos/tricoline/), evitando conteúdo duplicado.
 * - `compressHTML: true` mantém o espaçamento entre elementos inline
 *   (o padrão 'jsx' do Astro 7 remove espaços entre tags).
 * - `fonts`: as fontes são baixadas no build e servidas pelo próprio site
 *   (sem requisições ao Google em produção), com fallbacks otimizados
 *   para evitar "pulo" de layout. Ver src/styles/global.css.
 */
export default defineConfig({
  site: 'https://www.rosolentextil.com.br',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  fonts: [
    {
      // Texto corrido, navegação e botões.
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.google(),
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      // Títulos.
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-jakarta',
      provider: fontProviders.google(),
      weights: ['600 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      lastmod: new Date(),
    }),
  ],
  image: {
    // Imagens de bancos externos (se usadas via URL) precisam ser autorizadas aqui.
    remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org' }],
  },
});
