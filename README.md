# Guatemala — Uma história atravessa mundos

Experiência cinematográfica controlada pelo scroll, com versões em português e espanhol.

## Desenvolvimento

Na pasta `site`:

```bash
npm install
npm run dev
```

O servidor local usa a porta 5173 e aceita subdomínios `.trycloudflare.com` para testes em outros dispositivos.

## Produção

```bash
npm run build
npm run preview
```

O build estático é gerado em `dist`. Para publicar, envie **o conteúdo de `dist`** para a raiz do domínio ou subdomínio. O arquivo compactado de entrega também contém esse conteúdo diretamente na raiz.

## Estrutura

- `index.html`: narrativa e montagem das cenas.
- `src/main.js`: animações GSAP/ScrollTrigger e comportamento responsivo.
- `src/style.css` e `src/typography.css`: sistema visual e tipográfico.
- `src/security.js`, `src/security-viewer.js` e `src/security.css`: atlas dos elementos de segurança e experiência UV.
- `src/i18n.js` e `src/security-translations.js`: conteúdo em português e espanhol.
- `src/film.js` e `src/film.css`: player cinematográfico e tela cheia.
- `public/assets`: somente os arquivos carregados pela versão atual do site.

O projeto usa apenas arquivos locais em produção. O filme é carregado depois da ação do visitante, e as imagens responsivas usam versões próprias para desktop e celular.
