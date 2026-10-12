---
version: 1.0
name: Relatório vivo
description: Portfólio e currículo vivo de Bruno Galiz. Papel frio de relatório, tinta grafite e um único acento terra (a cor do chão de Campo Grande, "Cidade Morena", e do tijolo da foto). Grade suíça de 12 colunas que se quebra em momentos escolhidos, tipografia variável Mona Sans com o eixo de largura como voz, e dados em Monaspace. Feito para dois leitores ao mesmo tempo, o recrutador e o robô do recrutador, por isso nada nasce invisível.

colors:
  papel: "#EFF0EC"
  papel-2: "#E5E7E1"
  tinta: "#15171A"
  tinta-2: "#474C54"
  tinta-3: "#61676F"
  fio: "#D3D6CF"
  fio-controle: "#787C74"
  terra: "#A63D17"
  terra-forte: "#86300F"
  sobre-terra: "#F7F3EE"
  escuro-papel: "#121417"
  escuro-papel-2: "#1A1D21"
  escuro-tinta: "#E9EAE6"
  escuro-tinta-2: "#AEB2B8"
  escuro-tinta-3: "#8B9097"
  escuro-fio: "#2A2E33"
  escuro-fio-controle: "#6A7078"
  escuro-terra: "#E0784C"

typography:
  nome:
    fontFamily: "Mona Sans"
    fontSize: "clamp(3rem, 1.4rem + 6vw, 6rem)"
    fontWeight: 700
    fontStretch: 125%
    lineHeight: 0.9
    letterSpacing: -0.04em
  ano:
    fontFamily: "Mona Sans"
    fontSize: "clamp(3.25rem, 1.6rem + 6.4vw, 6rem)"
    fontWeight: 700
    fontStretch: 118%
    fontVariantNumeric: tabular-nums
  h1:
    fontFamily: "Mona Sans"
    fontSize: "clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)"
    fontWeight: 650
    fontStretch: 110%
    letterSpacing: -0.035em
  h2:
    fontFamily: "Mona Sans"
    fontSize: "clamp(1.75rem, 1.25rem + 2vw, 2.75rem)"
    fontWeight: 650
    fontStretch: 108%
    letterSpacing: -0.02em
  entrega:
    fontFamily: "Mona Sans"
    fontSize: "clamp(1.375rem, 1.1rem + 1.2vw, 2.125rem)"
    fontWeight: 560
    lineHeight: 1.22
  corpo:
    fontFamily: "Mona Sans"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  dado:
    fontFamily: "Monaspace Neon"
    fontSize: 0.8125rem
    fontWeight: 400

rounded:
  tudo: 0

spacing:
  e-1: 0.25rem
  e-2: 0.5rem
  e-3: 0.75rem
  e-4: 1rem
  e-5: 1.5rem
  e-6: 2.25rem
  e-7: 3.5rem
  e-8: 5.5rem
  e-9: 8rem
  secao: "clamp(4.5rem, 3rem + 6vw, 8.5rem)"
  largura: 88rem
  margem: "clamp(1rem, 4vw, 4rem)"
  goteira: "clamp(1rem, 2.2vw, 2.25rem)"
  medida: 64ch

motion:
  saida: "cubic-bezier(0.23, 1, 0.32, 1)"
  troca: "cubic-bezier(0.77, 0, 0.175, 1)"
  controle: 160ms
  estado: 240ms
  maximo: 600ms

components:
  botao:
    border: "1px solid {colors.fio-controle}"
    rounded: 0
    padding: "0.6rem 1.1rem"
    minHeight: 2.75rem
  botao-principal:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    hover: "{colors.terra}"
  previa:
    border: "1px solid {colors.fio}"
    imagem: "1200x630, do próprio site do projeto"
  retrato:
    aspectRatio: "3 / 4"
    marcas: "marcas de corte de gráfica em {colors.terra}, 1px"
---

## Visão geral

O site é um **currículo vivo**: a home tem a ordem e os títulos de um currículo (Resumo, Experiência, Projetos, Competências, Formação, Contato), porque é isso que ATS e leitores por IA reconhecem como campo. Para a pessoa, a Experiência é uma história: o ano gigante rola como odômetro, uma régua mostra a carreira de 2018 até hoje (com a lacuna como trecho vazio, sem texto), e cada cargo abre pela **principal entrega**, escrita como título de capítulo.

O mundo visual é o de um **relatório**: papel frio (não creme), tinta grafite, fio fino, raio zero, nenhuma sombra. Um acento só, terra. A foto real entra como o "3x4" da ficha de admissão, com marcas de corte de gráfica, e na primeira visita se revela de uma retícula de pontos para fotografia.

## Cores

- **Papel** `#EFF0EC` é o fundo. Frio de propósito: o creme quente é o fundo padrão de quase todo site gerado por IA.
- **Tinta** `#15171A` (15,7:1), **tinta-2** `#474C54` (7,6:1) e **tinta-3** `#61676F` (5,0:1) fazem a hierarquia de texto. Metadado nunca abaixo de 4,5:1.
- **Terra** `#A63D17` (5,6:1) é o único acento: ação, ano corrente, item em uso, foco. A mesma família de cor do tijolo da foto.
- **Fio-controle** `#787C74` (3,7:1) contorna campos e botões, acima do 3:1 da WCAG 1.4.11.
- Escuro: mesmos papéis, valores próprios (tabela acima). Claro é o padrão porque o recrutador lê de dia; o escuro vem da preferência do sistema ou do botão.

## Tipografia

- **Mona Sans** (GitHub, OFL), variável em peso (300–800) e **largura (75–125)**. A largura é a voz: o nome usa 125%, os títulos 108–110%, o corpo 100%. Na chegada, o nome se acomoda de 75% para 125%.
- **Monaspace Neon** (GitHub Next, OFL) só onde há dado: datas, períodos, domínio de prévia, cabeçalho de tabela, terminal. Nunca como fantasia "técnica" em rótulo.
- Display máximo 6rem; tracking mínimo -0,04em; corpo com medida de 64ch.
- Reservas com métricas medidas (size-adjust e ascent-override) para a troca de fonte não deslocar linha.

## Layout

Grade de 12 colunas, 88rem no máximo. Cada seção usa uma composição diferente: cabeçalho em split assimétrico (texto 8 colunas, retrato 4), resumo deslocado (título 3, texto 8), história com o tempo preso à esquerda (4 + 8), relatório em largura total, projetos em faixa horizontal, competências em colunas de lista sem caixa, contato com o endereço grande. Abaixo de 48rem tudo vira uma coluna, declarado seção por seção.

## Movimento

Uma linguagem só (`--saida` e `--troca`), controles 140–200 ms, estados 220–260 ms, nada acima de 600 ms. **Regra que não se negocia: nada nasce invisível.** Animação parte de um estado legível e só desloca (transform, eixo de fonte, clip-path). Momentos: o nome se acomoda (1× por sessão), o retrato se revela da retícula (1× por sessão), o odômetro do ano, a marca da régua (scroll-driven), o caso completo abrindo, o relatório filtrando com View Transition, a troca de tema em círculo. Tudo desliga sob `prefers-reduced-motion`.

## Voz

Primeira pessoa, frases curtas, substantivo concreto. Nenhum travessão (— ou –): ponto, vírgula, dois-pontos ou parênteses. Nenhum número que o Bruno não saiba explicar numa entrevista. O vocabulário das vagas (APIs REST, migração de legado, CI/CD) só onde é verdade (`docs/termos-vagas.md`). Fala com quem contrata, não com cliente de freela.

## Do

- Toda informação no HTML, visível sem JS e sem rolar (`npm run robo` verifica).
- Imagem real: a foto do Bruno e prévias montadas dos metadados dos próprios sites.
- Demonstrar em vez de afirmar: o relatório que sai igual à tela, o campo criado sem deploy.
- Uma fonte de texto (`conteudo/curriculo.mjs`) para todas as saídas.

## Don't

- Travessão em qualquer texto visível, data ou `<title>`.
- Numeração de seção (001, 002), eyebrow em caixa alta, ponto decorativo (o único ponto é a disponibilidade real).
- Faixa de cidade e hora, grão, vinheta, cursor custom, brilho que segue o mouse, botão magnético.
- Gradiente, glass decorativo, sombra, raio, três cards iguais, pílula sobre imagem, indicador de scroll.
- Revelação por opacidade, `loading="lazy"` ou `decoding="async"` em conteúdo que o robô precisa ver.
- "Sólido", "robusto", "apaixonado", "transformar ideias", "não é só X, é Y".
- Fundo creme, bege com latão, serifa de texto, Inter, Bricolage.
