# Gabriel Pereira Coelho

Cartão de contatos pessoal para https://gabrielpcoelho.github.io, feito com React, TypeScript e Vite.
Abre sempre em português, com opção manual de inglês. Sem analytics, backend, preferência de idioma
salva, fontes remotas ou serviços externos de ícones.

Adaptado do site de contatos de Gabriel de Souza Lima (https://github.com/limagabri/limagabri.github.io).

## Desenvolvimento e verificações

Use Node 24 e npm:

```sh
npm ci
npm run dev
```

Para validar a versão de produção:

```sh
npm run build
npx playwright install --with-deps chromium
npm test
npm run preview
```

Os testes de navegador conferem os links e a ordem, a troca de idioma e o retorno ao português a cada
carregamento (mesmo com navegador em inglês), a foto e o fallback GC, foco de teclado, nomes acessíveis,
WCAG A/AA, movimento reduzido, áreas de toque e ausência de rolagem horizontal em 320/375/768/1440px.
Capturas de tela ficam em `test-results/` e o relatório em `playwright-report/` (ignorados pelo Git).

## Editar contatos e textos

Tudo fica em **`src/data/profile.ts`**: nome, iniciais, descrição (`role`), textos da interface e a lista
de contatos. A ordem do array é a ordem na tela. Cada contato tem `id`, `name`, `href` e uma descrição
em `pt-BR` e `en`; mantenha as duas traduções. Para adicionar um serviço,
coloque o SVG correspondente em `public/icons/<id>.svg`, registre a origem e a licença em
`public/icons/sources.json` e `THIRD_PARTY_NOTICES.md`, e atualize a lista em `tests/contact.spec.ts`.
Links `mailto:` recebem automaticamente o texto acessível "Enviar e-mail".

`src/App.tsx` renderiza os dados e `src/styles.css` cuida da aparência.

## Cores

A paleta (tema claro, com verde floresta e âmbar) fica nas variáveis do `:root`, no topo de `src/styles.css`, e vale
para as duas páginas. Fora do CSS, as mesmas cores aparecem em `theme-color` (`index.html` e
`qr/index.html`), `public/qr/manifest.webmanifest`, `public/favicon.svg`, nos ícones de serviço em
`public/icons/` e no ícone do app gerado por `scripts/generate-qr-assets.mjs`.

## Foto

Salve a foto como **`public/images/profile.jpg`** (nome exato) e faça commit. Prefira um recorte quadrado
de cabeça e ombros, 400 a 600px e menos de 150KB. Não é preciso editar componentes. Enquanto não houver
foto, ou se ela falhar, aparecem as iniciais GC.

## Cartão QR offline

Abra **https://gabrielpcoelho.github.io/qr/** no celular. O código aponta para
https://gabrielpcoelho.github.io/ e é gerado localmente no build, sem serviço externo de QR.
Espere aparecer **Disponível offline** antes de desconectar; depois disso `/qr/` abre sem internet.
Para instalar: no Android, menu do navegador → **Instalar app**; no iPhone, Safari → **Compartilhar →
Adicionar à Tela de Início**.

- `src/data/qr.ts`: endereço do QR e textos da página.
- `scripts/generate-qr-assets.mjs`: gera `public/qr/code.svg` e os ícones GC no `prebuild`.
  Não edite esses arquivos gerados à mão.
- `scripts/build-qr-worker.mjs`: gera `dist/qr/sw.js` depois do Vite. A versão do cache muda sempre
  que algum arquivo do cartão muda, inclusive a foto. A foto só entra no cache se existir.

Os testes automáticos não substituem instalar e escanear em um celular de verdade.

## Publicação no GitHub Pages

O repositório precisa se chamar `gabrielpcoelho.github.io`. Em **Settings → Pages → Build and
deployment → Source**, escolha **GitHub Actions**. O workflow `.github/workflows/pages.yml` valida PRs e,
na `main`, instala pelo lockfile, compila, roda os testes e publica só a pasta `dist`.

## Manutenção pelo celular

1. Abra o repositório no GitHub pelo navegador do celular.
2. Para textos e links, edite `src/data/profile.ts` (ícone de lápis) e faça commit.
3. Para a foto, abra `public/images`, use **Add file → Upload files** e envie `profile.jpg`
   (se precisar, use a versão para desktop do site).
4. Acompanhe **Actions** e depois recarregue https://gabrielpcoelho.github.io.

Logos e licenças: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
