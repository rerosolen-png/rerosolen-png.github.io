# Como contribuir

Obrigado por ajudar a manter o site da Rosolen Têxtil. Este guia descreve o fluxo de trabalho
esperado para qualquer mudança, de um ajuste de texto a uma nova funcionalidade.

## 1. Antes de começar

- Use Node.js 24 (`nvm use` lê o `.nvmrc`).
- Instale as dependências com `npm install`.
- Abra uma issue descrevendo o que pretende fazer, se a mudança for maior que um ajuste pontual.

## 2. Branches

Nunca faça commits direto na `main`. Crie uma branch a partir dela:

```bash
git switch main && git pull
git switch -c content/novo-tecido-linho-puro
```

Prefixos: `feat/` (funcionalidade), `fix/` (correção), `content/` (tecidos, categorias, artigos, textos),
`docs/` (documentação), `chore/` (configuração, dependências), `ci/` (workflows).

## 3. Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português, no imperativo:

```
content: adiciona página do tecido linho puro
fix: corrige link do WhatsApp no rodapé
feat(tecidos): adiciona busca por composição no catálogo
```

Um commit por mudança lógica. Mensagens explicam o porquê quando não for óbvio.

## 4. Antes de abrir o pull request

```bash
npm run lint   # prettier + astro check
npm run build  # precisa passar sem erros
npm run preview
```

Confira a página alterada no navegador em largura de celular e de desktop.

## 5. Pull request

- Preencha o template (o que muda, tipo, checklist).
- O CI precisa ficar verde.
- Mudanças de conteúdo: confira ortografia, `description` entre 130 e 160 caracteres, links internos válidos
  e créditos de imagens.
- Merge por _squash_ para manter o histórico da `main` limpo.

## 6. Convenções de conteúdo

- Dados de contato só em `src/data/site.ts`.
- Texto sempre original, em português do Brasil, sem copiar descrições de outros sites.
- Sem preços nas páginas (os valores mudam; o orçamento é feito pelo WhatsApp).
- Cite "Ribeirão Preto" de forma natural, sem repetição artificial.
- Fotos: proporção 4:3, até 1600 px de largura, `alt` descritivo, crédito quando não forem da loja.
