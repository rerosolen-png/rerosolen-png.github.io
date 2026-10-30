# Rosolen Têxtil — site institucional

Site estático da **Rosolen Têxtil**, loja de tecidos em Ribeirão Preto/SP (Avenida da Saudade, 891, desde 1995).
Construído com [Astro](https://astro.build) e otimizado para SEO local: uma página por tecido, categorias com
guias de compra, artigos informativos, dados estruturados (schema.org) e sitemap automático.

- **Site no ar:** https://rerosolen-png.github.io/ (endereço temporário do GitHub Pages)
- **Domínio definitivo:** https://www.rosolentextil.com.br (registrado; falta apontar o DNS, ver [Publicação](#publicação))
- **Repositório:** https://github.com/rerosolen-png/rerosolen-png.github.io (público)
- **Stack:** Astro 7 (saída estática), TypeScript, CSS puro com design tokens, `@astrojs/sitemap`, Prettier
- **Hospedagem:** GitHub Pages via GitHub Actions (qualquer host estático funciona: Netlify, Vercel, Cloudflare Pages)

## Sumário

1. [Requisitos](#requisitos)
2. [Como rodar](#como-rodar)
3. [Estrutura do projeto](#estrutura-do-projeto)
4. [Como editar o conteúdo](#como-editar-o-conteúdo)
5. [SEO: o que já está feito e o que falta](#seo-o-que-já-está-feito-e-o-que-falta)
6. [Publicação](#publicação)
7. [Fluxo de trabalho no GitHub](#fluxo-de-trabalho-no-github)

## Requisitos

- Node.js 24 (versão fixada em `.nvmrc`; mínimo 22.23.4)
- npm 10+

## Como rodar

```bash
npm install        # instala as dependências
npm run dev        # servidor local em http://localhost:4321
npm run build      # gera o site estático em dist/
npm run preview    # serve o build local para conferência
npm run lint       # checagem de tipos (astro check) + formatação (prettier --check)
npm run format     # formata todos os arquivos
npm run content:check   # valida frontmatter, descrições, slugs e links internos do conteúdo
npm run images:optimize # redimensiona/comprime as fotos de src/assets (máx. 1600 px, JPEG q80)
npm run images:link     # vincula fotos de src/assets ao frontmatter (image, imageAlt, imageCredit)
npm run og              # regenera public/og-default.jpg a partir de src/assets/hero.jpg
```

## Estrutura do projeto

```
├── .github/              # CI, deploy, templates de PR e issue, Dependabot
├── public/               # arquivos servidos como estão (robots.txt, favicon, CNAME, manifest)
├── src/
│   ├── assets/           # imagens otimizadas pelo Astro (tecidos/, categorias/, guia/, hero.jpg)
│   ├── components/       # header, footer, cards, breadcrumbs, FAQ, CTA, ícones
│   ├── content/
│   │   ├── tecidos/      # UMA PÁGINA POR TECIDO (Markdown + frontmatter)
│   │   ├── categorias/   # textos das categorias
│   │   └── guia/         # artigos do Guia de Tecidos (blog)
│   ├── content.config.ts # schema (validação) das coleções acima
│   ├── data/
│   │   ├── site.ts       # DADOS DA EMPRESA: endereço, telefones, horário, redes sociais
│   │   └── image-credits.json  # créditos das fotos de bancos de imagens
│   ├── layouts/BaseLayout.astro  # <head> com SEO, Open Graph, JSON-LD
│   ├── lib/seo.ts        # geradores de schema.org e helpers de URL
│   ├── lib/content.ts    # consultas às coleções (ordenação, categorias, relacionados)
│   ├── pages/            # rotas: /, /tecidos/, /tecidos/[slug]/, /categorias/..., /guia/..., etc.
│   └── styles/global.css # design tokens, reset e classes utilitárias
└── astro.config.mjs      # site, trailingSlash, sitemap
```

### Rotas geradas

| Rota                        | Origem                                  |
| --------------------------- | --------------------------------------- |
| `/`                         | `src/pages/index.astro`                 |
| `/tecidos/`                 | catálogo completo com busca             |
| `/tecidos/<slug>/`          | `src/content/tecidos/<slug>.md`         |
| `/categorias/`              | lista de categorias                     |
| `/categorias/<id>/`         | `src/content/categorias/<id>.md`        |
| `/guia/` e `/guia/<slug>/`  | `src/content/guia/<slug>.md`            |
| `/sobre/`, `/contato/`      | páginas institucionais                  |
| `/perguntas-frequentes/`    | FAQ geral (com schema FAQPage)          |
| `/politica-de-privacidade/` | LGPD                                    |
| `/creditos-de-imagens/`     | gerada a partir de `image-credits.json` |
| `/sitemap-index.xml`        | gerado no build                         |

## Como editar o conteúdo

### Dados da empresa (telefone, endereço, horário)

Tudo vem de **`src/data/site.ts`**. Altere ali e o rodapé, a página de contato, os botões de WhatsApp e os
dados estruturados são atualizados juntos. Nunca digite telefone ou endereço direto nas páginas.

### Adicionar ou editar um tecido

1. Crie `src/content/tecidos/<slug>.md` (o nome do arquivo vira a URL, ex.: `linho-puro.md` → `/tecidos/linho-puro/`).
2. Copie o frontmatter de um tecido existente (`tricoline-100-algodao.md` é o modelo de referência).
3. Campos obrigatórios: `title`, `description` (130–160 caracteres), `category` (id de uma categoria), `composition`, `width`, `uses`.
4. Campos recomendados: `seoTitle` (até 60 caracteres), `weight`, `elasticity`, `transparency`, `touch`, `care`, `characteristics`, `keywords`, `related` (slugs de outros tecidos), `faq` (3 perguntas), `featured` (aparece na home e no rodapé), `order` (ordem na categoria).
5. Para a foto: salve em `src/assets/tecidos/<slug>.jpg` (ideal: 1600 px de largura, proporção 4:3) e adicione no frontmatter:
   ```yaml
   image: ../../assets/tecidos/<slug>.jpg
   imageAlt: 'Descrição objetiva da foto'
   ```
   Se a foto vier de banco de imagens, inclua também `imageCredit` (autor, fonte, licença, url).
6. Escreva o corpo em Markdown seguindo as seções do modelo: o que é, características, usos, dicas de costura, cuidados e por que comprar na Rosolen Têxtil. Use links internos `/tecidos/<slug>/` e `/categorias/<id>/`.
7. Rode `npm run build`. O schema em `src/content.config.ts` valida o frontmatter e aponta qualquer erro.

### Categorias e artigos do guia

Mesmo princípio: `src/content/categorias/<id>.md` e `src/content/guia/<slug>.md`. Os campos estão documentados em
`src/content.config.ts`. Artigos com `draft: true` não são publicados.

### Fotos

O site aceita fotos próprias da loja (recomendado) ou de bancos de imagens com licença livre. As fotos de terceiros
em uso estão listadas em `src/data/image-credits.json` e exibidas em `/creditos-de-imagens/`. Ao substituir por fotos
próprias, remova a entrada correspondente do JSON e o campo `imageCredit` do frontmatter.

## SEO: o que já está feito e o que falta

**Implementado no código**

- Uma URL estável por tecido e por categoria, com `trailingSlash` consistente e canonical em todas as páginas
- `title` e `meta description` individuais; Open Graph e Twitter Cards
- Dados estruturados JSON-LD: `Store`/`LocalBusiness` (NAP, horário, geo, redes sociais), `WebSite`, `BreadcrumbList`,
  `Product` (tecidos), `ItemList` (listagens), `FAQPage` (perguntas), `Article` (guia), `AboutPage`, `ContactPage`
- `sitemap-index.xml` automático e `robots.txt`
- HTML semântico, hierarquia de títulos, `alt` em imagens, links internos entre tecidos, categorias e artigos
- Imagens otimizadas (WebP, dimensões explícitas, lazy loading), CSS crítico inline, zero JavaScript pesado
- Página 404 com `noindex`, acessibilidade (skip link, foco visível, contraste, menu acessível)

**Depois de publicar (checklist para a loja)**

1. Cadastrar o site no **Google Search Console** e enviar `https://www.rosolentextil.com.br/sitemap-index.xml`.
2. Adicionar o site no **Perfil da Empresa no Google** (hoje o perfil não tem website cadastrado) e manter nome,
   endereço e telefone idênticos aos de `src/data/site.ts`.
3. Colocar o link do site na bio do Instagram e na página do Facebook.
4. Trocar `public/og-default.jpg` (1200×630, usada ao compartilhar links) por uma imagem da fachada ou do
   logotipo; hoje ela é gerada da foto ilustrativa da home com `npm run og`.
5. Substituir gradualmente as fotos ilustrativas por fotos reais dos tecidos da loja.
6. Publicar um artigo novo no guia a cada mês e atualizar `updatedDate` nos tecidos revisados.

## Publicação

O fluxo `.github/workflows/deploy.yml` publica no **GitHub Pages** a cada push na branch `main` (ou manualmente
em _Actions → Deploy (GitHub Pages) → Run workflow_). O repositório é público, com _Settings → Pages → Source_
definido como _GitHub Actions_.

O repositório se chama `rerosolen-png.github.io` de propósito: um repositório com esse nome (_user site_) é servido
na raiz `https://rerosolen-png.github.io/`. Com qualquer outro nome o GitHub serviria o site em um subcaminho
(`/nome-do-repositorio/`), e os links absolutos do site (`/tecidos/...`, `/_astro/...`) quebrariam.

**Estado atual:** site no ar em https://rerosolen-png.github.io/. Falta apontar o domínio próprio.

**Como ativar www.rosolentextil.com.br**

1. No [registro.br](https://registro.br), entre com a conta dona do domínio, abra `rosolentextil.com.br` e edite a
   zona DNS (o DNS do domínio é hospedado no próprio registro.br). Crie os registros:
   - `www` → CNAME `rerosolen-png.github.io`
   - domínio raiz (campo de nome em branco) → registros A `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
2. Aguarde a propagação (de alguns minutos a algumas horas).
3. Em _Settings → Pages → Custom domain_ do repositório, informe `www.rosolentextil.com.br` e salve. Pelo
   terminal: `gh api -X PUT repos/rerosolen-png/rerosolen-png.github.io/pages -f cname=www.rosolentextil.com.br`.
4. Quando o GitHub emitir o certificado (alguns minutos depois do passo 3), marque _Enforce HTTPS_.
5. Recomendado: verifique o domínio na conta (_Settings do perfil → Pages → Add a domain_, registro TXT) para
   impedir que outra conta do GitHub use o domínio.

Com deploy via GitHub Actions, o arquivo `public/CNAME` é só servido como arquivo estático; o domínio precisa ser
definido nas configurações do Pages (passo 3). Feito isso, `https://rerosolen-png.github.io/` passa a redirecionar
para o domínio próprio, e os `canonical` e o sitemap, que já usam `www.rosolentextil.com.br`, ficam corretos.

Para outro host estático (Netlify, Vercel, Cloudflare Pages): comando de build `npm run build`, pasta `dist`.

## Fluxo de trabalho no GitHub

- `main` é a branch de produção: todo push nela publica o site. A proteção de branch (exigir CI verde e pull
  request) está disponível em _Settings → Branches_, já que o repositório é público; ative quando mais de uma
  pessoa editar o site, pois ela bloqueia pushes diretos em `main`.
- Crie branches curtas a partir de `main`: `feat/...`, `fix/...`, `content/...`, `chore/...`.
- Commits seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `content:`,
  `docs:`, `chore:`, `ci:`, `refactor:`.
- O CI (`.github/workflows/ci.yml`) roda formatação, checagem de tipos e build em cada PR.
- Dependabot abre PRs mensais para dependências npm e GitHub Actions.
- Veja [CONTRIBUTING.md](CONTRIBUTING.md) para o passo a passo.

---

© Rosolen - Comércio de Malhas e Tecidos Ltda. Todos os direitos reservados. Código e conteúdo deste repositório são
de uso exclusivo da Rosolen Têxtil.
