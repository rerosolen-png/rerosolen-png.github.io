// @ts-check
import { defineConfig } from 'astro/config';
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
 */
export default defineConfig({
  site: 'https://www.rosolentextil.com.br',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
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
