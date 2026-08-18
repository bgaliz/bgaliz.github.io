# Portfólio — Bruno Galiz

HTML, CSS e JavaScript sem framework, sem bundler e sem passo de build obrigatório.
Abrir `index.html` num servidor estático já funciona.

```bash
npm run servir      # http://localhost:8000
npm run verificar   # trava a camada temporal (32 testes)
npm run construir   # injeta datas e as etiquetas de ferramentas no HTML servido
```

---

## O problema que este projeto resolve

Os três currículos do Bruno (PT, EN e LinkedIn) diziam **"mais de 5 anos de experiência"** quando,
de jan/2019 até hoje, já eram **mais de 7**. O texto envelheceu e ninguém percebeu — nem em três
documentos diferentes.

A arquitetura inteira existe para tornar isso impossível de acontecer de novo.

---

## Como os dados temporais funcionam

**Nenhum número temporal é escrito à mão em lugar nenhum.**

```
assets/dados/perfil.js      ← todas as datas do projeto vivem aqui, e só aqui
        ↓
assets/js/tempo.js          ← contagem inclusiva, união de intervalos, Intl
        ↓
assets/js/dinamico.js       ← catálogo de ~47 slots nomeados
        ↓
    ┌───┴────────────────────────────┐
    ↓                                ↓
ferramentas/construir.mjs      assets/js/dinamico.js
(injeta no HTML servido)       (recalcula no navegador)
```

No HTML, cada valor é um slot:

```html
<span data-din="cargo.az.duracao">1 ano e 1 mês</span>
<span data-din="cargo.az.periodo">ago 2025 — atual</span>
<time  data-din="site.atualizado" datetime="2026-08-11">11 ago 2026</time>
```

### Por que duas camadas

| | Cobre |
|---|---|
| **GitHub Action mensal** roda `construir.mjs` | O crawler do Google, o card do LinkedIn e quem está sem JS — todos leem o HTML **cru** |
| **`dinamico.js`** recalcula no `load` | O intervalo entre as execuções do cron |

Nenhuma das duas é obrigatória: cada uma sozinha mantém o site correto. Juntas, o portfólio não
envelhece sem alguém notar.

### Três detalhes que não são óbvios

1. **Contagem inclusiva.** `meses = (anoF×12 + mesF) − (anoI×12 + mesI) + 1`.
   O LinkedIn conta as duas pontas do intervalo; sem o `+ 1`, toda duração aqui sairia um mês menor
   que a do perfil dele — inconsistência que qualquer pessoa cruzando os dois enxerga.
   `npm run verificar` valida isso contra os 6 cargos encerrados.

2. **União de intervalos, não soma.** O freelance na Calango Doido (fev/2022 – jan/2023) roda em
   paralelo com SGI e Conexa. Somar durações contaria 91 meses; a união conta os 81 reais.

3. **`fim: null` significa "em curso".** O rótulo "atual"/"current", o selo no verbete e a duração
   que cresce todo mês são todos derivados disso — nunca escritos.

### Acrescentar um cargo

Edite `assets/dados/perfil.js` e o trecho correspondente no `index.html`. Ordem cronológica,
durações, contagem de empresas e domínios, e a faixa da linha do tempo se ajustam sozinhos.

> ⚠️ Há uma lacuna real de 10 meses entre Easy Imóveis (set/2024) e AZ (ago/2025), visível na trajetória.
> Se houve freela ou estudo no período, acrescente a entrada — o resto se recalcula.

---

## Onde mora o quê

```
index.html                 conteúdo completo em PT · inglês em data-en · valores em data-din
painel.html                painel de visitas (token)
privacidade.html           o que é registrado, e como recusar

assets/dados/perfil.js     FONTE ÚNICA DE VERDADE — estrutura e datas
assets/js/tempo.js         cálculo temporal (sem dependências, roda no Node e no navegador)
assets/js/dinamico.js      catálogo de slots + aplicação no DOM
assets/js/{tema,idioma}.js troca de tema e idioma, com View Transitions
assets/js/abertura.js      abertura coreografada, uma vez por sessão
assets/js/refletor.js      o círculo de luz que segue o ponteiro (só coordenadas)
assets/js/rastro.js        registro de visitas (falha sempre em silêncio)
assets/css/tokens.css      paleta dupla, tipografia, curvas, grão

api/                       funções da Vercel: coletar e painel
ferramentas/               construir.mjs e verificar-tempo.mjs
```

**A prosa vive no `index.html`, não em `perfil.js`.** O HTML precisa contê-la de qualquer forma
(crawler, sem-JS); duplicá-la no JS faria o navegador baixar o mesmo texto duas vezes e criaria duas
cópias que divergiriam na primeira edição apressada.

---

## Bilíngue sem duplicar arquivo

O HTML é escrito em português **estaticamente** — crawler e leitor sem JS veem tudo. O inglês vive
em atributo, e a troca é uma inversão reversível:

```html
<h2 data-en="Career">Trajetória</h2>
```

Ao trocar de idioma, os valores temporais são **reformatados** pelo idioma novo, com a pluralização
real de cada língua via `Intl.PluralRules` — "1 ano e 1 mês" ⇄ "1 year 1 month".

---

## Orçamento de performance

| | |
|---|---|
| JS crítico (bloqueia a primeira pintura) | **11,5 KB** gzip |
| JS adiado (import dinâmico) | 5,4 KB gzip |
| CSS (5 arquivos) | 13,4 KB gzip |
| Fontes (3 variáveis, subsetadas) | 160 KB — de 287 KB |
| Imagens no site | 0 KB (só o card social, fora da página) |

Abertura, rastro e refletor entram por `import()` dinâmico: nenhum precisa existir antes da
primeira pintura. A abertura não existe sob `prefers-reduced-motion`; o refletor também não, nem
sob ponteiro grosso.

**Não há imagem nenhuma na página.** O nome é tipografia pura, e onde a referência põe a miniatura
do projeto aqui vai a coluna do período — a mesma célula da grade, ocupada por informação em vez de
ilustração. O único arquivo de imagem é o card social, que só o LinkedIn e o WhatsApp carregam.

---

## Deploy

### 1. Site — GitHub Pages

Repositório `bgaliz.github.io`, branch principal. Nada mais. A URL é a que já está nos três
currículos.

### 2. API e painel — Vercel *(opcional)*

O portfólio funciona 100% sem isto. Enquanto `API_BASE` for `null` em `assets/js/config.js`, o
rastreamento fica desligado e o aviso de privacidade não aparece.

```bash
npm i -g vercel
vercel link                     # importa o mesmo repositório
```

1. No painel da Vercel: **Storage → Marketplace → Neon** (plano gratuito).
   Isso define `DATABASE_URL` sozinho.
2. Adicione as variáveis de ambiente:
   - `PAINEL_TOKEN` — a senha do painel, escolhida por você
   - `SAL_VISITANTE` — qualquer string longa e aleatória
3. Em `assets/js/config.js`, troque:
   ```js
   export const API_BASE = 'https://SEU-PROJETO.vercel.app/api';
   ```
4. Commite e faça o deploy. A tabela é criada sozinha na primeira visita.

> O plano Hobby da Vercel é para uso pessoal e não comercial — um portfólio se enquadra.

---

## Privacidade

**O IP nunca é gravado.** Ele existe só em memória, por um instante, para compor
`sha256(ip + user-agent + dia + sal)`. O sal roda diariamente: o hash de hoje não pode ser ligado ao
de ontem nem revertido para o IP.

Sem cookies. Sem terceiros. Sessão em `sessionStorage`, que morre com a aba. `Do Not Track` e
`Global Privacy Control` são respeitados sem o usuário precisar fazer nada.

### Links marcados

Ao enviar o portfólio para um contato ou proposta, use uma etiqueta:

```
https://bgaliz.github.io/?ref=nubank-proposta-front
```

O painel mostra quantas aberturas, quantas pessoas distintas, quando foi a primeira e a última, e se
houve clique em contato. É o que responde *"o que eu enviei foi aberto?"*.

O painel tem um gerador que monta essas etiquetas.

---

## Decisões que talvez surpreendam

**Nenhuma métrica de impacto.** Os três currículos se contradiziam — o mesmo projeto aparecia como
"10.000 usuários" num e "50.000" noutro; a busca de imóveis reduzia "10%" num e "40%" noutro. Número
que muda conforme o documento não sobrevive à pergunta *"como você mediu?"* numa entrevista.
Foram trocados por especificidade técnica, que convence mais quem entende e é 100% defensável.

**A Unisys está na linha do tempo.** Não é cargo de desenvolvedor e por isso tem
`contaComoDev: false` (não infla o tempo de carreira). Mas mostra a progressão TI → dev em vez de
escondê-la.

**Idade não aparece.** Data de nascimento não existe em nenhum dos três currículos, e não se
inventa dado.

**Sem scroll sequestrado, sem WebGL, sem imagem na página.** Dos portfólios premiados de 2026:
*"o efeito nunca sufoca o trabalho que deveria emoldurar"*. Um recrutador decide em 6 a 7 segundos —
o que atrasa o carregamento custa justamente esses segundos. O que sobrou de movimento é a abertura
coreografada, a revelação ao entrar na tela e o refletor que segue o ponteiro: os três custam zero
requisição.

**Nenhuma nota de proficiência, e nenhuma forma que possa ser lida como nota.** A seção 004 já
foi uma matriz 35×6 (77% das células diziam "não") e já foi uma fileira de pontinhos contando
projetos — que todo leitor entendeu como "5/5 em TypeScript, 1/5 em quase tudo o resto", o oposto
do que os dados diziam. Qualquer marcador ordinal é lido como nota, então não há nenhum: as
tecnologias são agrupadas por CAMADA (o corte que um cliente pergunta), a ordem dentro da camada
põe o que é de hoje na frente, e o nível vive numa frase por bloco. O legado tem bloco próprio e é
enquadrado como força — em governo e saúde, manter de pé sistema que não pode parar é metade do
trabalho.

**A casca é de duas colunas, e não é 50/50.** A identidade fica presa à esquerda e nunca sai da
tela; o conteúdo rola à direita. A razão é `0.86fr / 1.14fr` — lê como duas metades, não é, e dá à
coluna de conteúdo o ar de que a seção de ferramentas precisa. Abaixo de 64rem tudo empilha.

**Uma gramática de cartão só, para cargo, recorte e formação.** `.rol` é a lista, `.verbete` é a
entrada: período na coluna estreita, título e prosa na larga, stack em etiquetas. No hover o fundo
se levanta, a seta anda e os **irmãos esmaecem** — o olho fica onde o ponteiro está. O esmaecer usa
`filter: opacity()`, não `opacity`, porque a revelação scroll-driven já anima `opacity` e animação
vence declaração.

**O refletor é um `radial-gradient` atrás do conteúdo.** O JS escreve só coordenadas em
`--refletor-x` / `--refletor-y`, uma vez por quadro; a aparência inteira mora no CSS, então trocar
de tema troca a cor sem o JS conhecer cor nenhuma — no escuro é um clarear de 4,5%, no papel uma
sombra quente de 6%. Não existe sob ponteiro grosso nem sob movimento reduzido.

---

## Acessibilidade

- Contraste AA verificado nos **três** blocos de tema (padrão, preferência do sistema, escolha
  explícita) — 0 falhas
- Navegação completa por teclado, foco sempre visível
- A seção 004 não tem marcador de nível nenhum para descrever: cada camada é um título, uma frase
  e uma lista de nomes, então o leitor de tela ouve exatamente o que o olho vê
- O período de cada verbete é lido antes do título, na ordem do DOM — sem depender da ordem visual
- `prefers-reduced-motion` desliga coreografia, scroll-driven e refletor — mantendo hover e foco
- Todo o conteúdo existe sem JavaScript, já com as datas corretas
