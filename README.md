# Guatemala — Uma história atravessa mundos

Experiência cinematográfica de scroll, atualizada a partir de `NOVO-CLIPE/cedula-final.mp4` e das pranchas técnicas de `referencias/`.

## Executar

Na pasta `site`, use `npm install` e `npm run dev`. A porta configurada é 5173. `npm run build` produz a distribuição estática em `dist`; `npm run preview` permite conferir essa distribuição. A configuração mantém os subdomínios `.trycloudflare.com` permitidos para túneis de teste.

## A experiência

- Abertura em Xibalbá com a pergunta do novo filme e duas chamadas imediatas de cinema. No desktop, o scroll abre a raiz para a luz da ceiba; no celular e com movimento reduzido, a ceiba ganha uma cena vertical própria.
- Travessia por quetzal, Tecún Umán e Tikal. Horizontal no desktop, vertical em telas menores.
- Transformação do jaguar em matéria: uma máscara revela o master frontal, com ampliação e recuo proporcionais, sem redesenho.
- Atlas com 11 chamadas de segurança documentadas e o substrato, faces selecionáveis, pontos de interesse e macros originais. Desktop reúne seleção e detalhe; a procedência fica nos dados, sem rótulos técnicos na interface.
- Laboratório UV com luz radial, ampliação uniforme até 2× limitada pela resolução, deslocamento entre áreas guiadas e revelação integral. Mouse, toque e teclado; sem slider de comparação.
- Fecho em Tikal e nova chamada para o filme. O acesso ao cinema permanece no cabeçalho durante a jornada.
- Português e espanhol com escolha persistente no cabeçalho. A troca mantém a seleção do atlas e os estados de exploração UV.

## Fidelidade e fontes

O filme novo tem faixa de vídeo de 51,791667 segundos e é copiado sem recodificação, incluindo áudio e legendas em espanhol incorporadas. Não utiliza o VTT antigo.

Os três masters JPG de `referencias/` são copiados byte a byte. Os previews técnicos são WebP sem perdas após redução proporcional; verso e UV têm exatamente as mesmas dimensões. Os 13 macros de segurança são cortes geométricos dos detalhes fornecidos na prancha técnica, sem geração, retoque, alteração de cor ou reconstrução de grafismos.

`public/assets/v2/manifest.json` registra fontes, dimensões, operações, tamanhos e SHA-256. `public/assets/v2/security/security-data.json` registra textos, localização e fonte por elemento. O folder atual tem prioridade sobre o book explicitamente anterior; informações complementares do book são atribuídas. Cenas narrativas são interpretações artísticas; a peça é uma cédula conceitual sem valor monetário.

## Arquitetura

- `index.html`: narrativa e pontos de montagem dos módulos.
- `src/main.js`: GSAP/ScrollTrigger, scroll nativo, navegação, preferência de movimento e reconstrução responsiva.
- `src/style.css`: sistema visual, tipografia local e composições desktop/mobile.
- `src/security.js` e `security.css`: atlas técnico e inspeção UV.
- `src/i18n.js` e `src/security-translations.js`: idiomas da narrativa, acessibilidade e terminologia técnica.
- `src/film.js` e `film.css`: cinema com dialog, controles nativos, fullscreen, pausa e retorno de foco.
- `prepare_assets.py`: preparação reproduzível dos assets V2; execute a partir da raiz do Projeto com Python/Pillow.
- `design/DIRECAO-V2.md`: decisões de direção e hierarquia das fontes.
- `design/RELATORIO-CREDITOS-V2.md`: registro de gerações, consumo e saldo Magnific desta atualização.

Desktop com pelo menos 1000 × 650 px e ponteiro preciso usa três composições fixadas. Em telas menores, a narrativa vertical tem parallax, máscaras e entradas de texto; a partir de 650 px de altura, o jaguar e a cédula compartilham uma transição fixada curta. A opção local de movimento reduzido e a preferência do sistema retiram as animações sem remover conteúdo ou controles. Links diretos são reposicionados após o cálculo dos pins. A cédula original aparece inteira sobre o ambiente escuro do jaguar.

O cinema dimensiona a imagem pelos dois limites da área disponível, preservando a proporção original. Uma faixa preta abaixo do quadro reserva espaço para os controles nativos. A tela cheia mantém o mesmo enquadramento.

As bandeiras locais `public/assets/flags/br.svg` e `es.svg` vêm dos arquivos Wikimedia `Flag_of_Brazil.svg` e `Flag_of_Spain.svg`; são vetores autocontidos, sem carregamento externo.

Fontes e conteúdo são locais. Nenhuma chave, serviço externo, WebGL ou geração de IA é necessária em tempo de execução. O filme é carregado somente após ação do visitante; não há sequência de dezenas de frames decodificados em memória. Assets V1 foram preservados para recuperação, mas a página nova só referencia V2. A versão anterior do código está em `.codex-build/site-v1-backup`, fora da pasta pública.
