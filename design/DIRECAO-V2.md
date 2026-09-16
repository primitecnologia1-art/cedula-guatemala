# Guatemala — Uma história atravessa mundos

## Fontes e decisões

O corte final `NOVO-CLIPE/cedula-final.mp4`, 51,792 s, exportado em 16/09/2026, prevalece sobre os roteiros de 50, 53 e 57 segundos. A narração revisada fornece a pergunta de abertura. O DOCX e o storyboard mostram fases anteriores (incluindo Tecún escultórico e outro fecho); não são usados como retrato do corte final. O filme já tem legendas em espanhol incorporadas: nenhum VTT da versão anterior acompanha esta versão.

Todas as imagens em NOVO-CLIPE/images foram comparadas. As versões intermediárias de Xibalbá, o Tikal anterior e os heroes gerados da cédula não substituem os masters técnicos. Os arquivos de revisão, áudio, clipes e análise de montagem documentam a passagem Xibalbá → ceiba → quetzal → Tecún → Tikal → jaguar → papel → UV → fecho. Os arquivos Premiere/auto-saves/cache são produção, não assets de interface. A nova versão usa cenas estáticas desse universo com composição e movimento DOM, sem sequência de frames em memória.

As pranchas GUATEMALA 30X21 são prioritárias para os nomes e itens de segurança. O book anterior é fonte secundária, explicitamente distinguida. A auditoria detalhada e o JSON registram cada procedência. Os três JPGs técnicos são copiados sem alterar bytes; previews usam compressão sem perdas após redução proporcional. Macros são recortes exatos da prancha fornecida. Não há retoque nem reconstrução técnica.

## Direção completa

1. **A pergunta / origem.** Tela subterrânea UV; tipografia branca monumental à esquerda, filme com preview e ação explícita desde o hero. A câmera de scroll aproxima a raiz enquanto uma abertura circular revela a ceiba; a pergunta dá lugar a “Uma história atravessa mundos”. Navegação fixa mantém “Assistir ao filme”.
2. **A travessia.** Três cenas horizontais no desktop: quetzal / Liberdade; Tecún Umán / Resistência; Tikal / Memória. Imagens completas do novo universo, deslocamento independente de imagem e tipo, proporções generosas. No celular: três capítulos verticais, crops orientados por assunto e pequenas entradas.
3. **A matéria.** Jaguar em escala monumental, seguido por abertura de máscara para o papel. O master frontal recua proporcionalmente até a cédula integral. Texto: “Identidade em segurança”. Nenhuma deformação em perspectiva no master.
4. **O atlas.** Fundo papel, palco com originais, seleção de faces, pontos registrados e recortes fornecidos. Doze entradas (11 chamadas + material), descrições concisas e fonte visível. Controles completos por teclado e toque.
5. **Outra luz.** Pausa escura e tipografia em grande escala abrem um laboratório UV. A lanterna revela o master UV através de máscara circular, registrada no mesmo plano do verso. Pontos guiados e revelação integral tornam o conteúdo acessível sem exigir gesto preciso. A ambientação aparece ao redor da arte, sem filtros nos detalhes.
6. **O futuro / filme.** Volta à luz de Tikal, “Para seguir adiante”, chamada de cinema ampla; rodapé explicita a natureza conceitual da cédula.

## Sistema

- Fundo noite #080d0d; papel #eae5d8; texto claro #f4f0e6; texto escuro #14221d; acento #d2e5bc; UV #090c12.
- Anton para títulos monumentais, Manrope para corpo/controles. Fontes locais. Cabeçalho 12–13 px, corpo 15–18 px, títulos responsivos clamp. Sem grades de cards; cenas, palcos, linhas e painéis abertos.
- Controles com alvo ≥44 px, foco visível, sem som automático; cinema fullscreen com controles nativos, pausa ao fechar e retorno de foco.
- Desktop somente em largura ≥1000 e altura ≥650, com contexto GSAP reconstruído em ordem de documento. Mobile vertical, sem pins longos e sem bloqueio do gesto de rolagem. Movimento reduzido preserva todo conteúdo e controles.

## Economia e fidelidade

A orientação genérica da skill para gerar novos conceitos foi adaptada à prioridade explícita do usuário: usar materiais existentes quando suficientes e gerar somente com ganho visual claro. A direção parte da prancha de contato dos novos assets e das referências originais; nenhuma imagem técnica nem cenário é regenerado. A composição é construída em HTML/CSS/GSAP. Magnific: consulta de saldo inicial 1.416.482 créditos; gerações e consumo da atualização são registrados separadamente no relatório final.
