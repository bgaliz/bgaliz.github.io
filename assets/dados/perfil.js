/**
 * FONTE ÚNICA DE VERDADE — ESTRUTURA E DATAS
 * ══════════════════════════════════════════════════════════════════════════
 * Toda data do projeto vive aqui e em nenhum outro lugar. Nenhum número
 * temporal deve ser escrito à mão no HTML — use slots `data-din` e deixe
 * `tempo.js` + `dinamico.js` calcularem.
 *
 * ── ONDE MORA A PROSA ────────────────────────────────────────────────────
 * Os textos corridos (contexto dos cargos, o que foi feito, bio) NÃO estão
 * aqui: eles vivem só no index.html. Motivo: o HTML precisa contê-los de
 * qualquer forma, para o crawler e para quem está sem JS. Mantê-los também
 * neste arquivo faria o navegador baixar o mesmo texto duas vezes e, pior,
 * criaria duas cópias que divergiriam na primeira edição apressada.
 *
 * A divisão é: prosa no HTML, estrutura e datas aqui.
 *
 * Formato de data: 'AAAA-MM'. `fim: null` significa "em curso" — o rótulo
 * "atual"/"current" é DERIVADO disso, nunca escrito.
 *
 * ── DECISÕES DE RECONCILIAÇÃO DOS 3 CURRÍCULOS ───────────────────────────
 * 1. MÉTRICAS REMOVIDAS. Os currículos se contradizem entre si:
 *      • SGI/Ionic ....... "10.000 usuários" (PT) vs "50.000+" (EN)
 *      • Easy Imóveis .... "10% mais rápido" (PT) vs "40%" (EN)
 *      • Reduza .......... "SEO +30%" (PT) vs "cupons +40%" (EN)
 *    Número que muda conforme o documento não sobrevive à pergunta "como
 *    você mediu?". Trocados por especificidade técnica no HTML.
 *
 * 2. E-MAIL. Currículos PT/EN trazem brunogaliz2@gmail.com; o LinkedIn traz
 *    brunogaliz@hotmail.com. Adotado o gmail (documentos mais recentes).
 *
 * 3. INÍCIO DA GRADUAÇÃO. LinkedIn diz jan/2014; currículos dizem fev/2014.
 *    Adotado fev/2014 (mais específico).
 *
 * 4. UNISYS entra na linha do tempo, mas com `contaComoDev: false` — mostra
 *    a progressão TI → dev sem inflar o tempo de carreira.
 *
 * 5. DATA DE NASCIMENTO não existe em nenhum dos 3 currículos. Idade fica
 *    fora — não se inventa dado.
 *
 * 6. LACUNA de 10 meses entre Easy Imóveis (set/2024) e AZ (ago/2025), mais
 *    uma de 1 mês em jul/2024. Se houve freela ou estudo no período,
 *    acrescente uma entrada em EXPERIENCIAS — trilho, durações e totais se
 *    recalculam sozinhos. (Confirmado por `npm run verificar`.)
 *
 * 7. CALANGO DOIDO foi freelance, e `recorte: false` reflete isso: o cargo
 *    continua na trajetória (002) e sua stack continua em ferramentas (004),
 *    mas sai dos recortes (003) e, por consequência, da meta description —
 *    que era onde "Web3" aparecia como se fosse eixo da carreira. Trabalho
 *    executado é uma coisa; trabalho em destaque é outra.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const PERFIL = {
  nome: 'Bruno Galiz de Oliveira',
  iniciais: 'BGO',

  /** Primeiro cargo de desenvolvedor. Base do "desde 2019". */
  inicioCarreira: '2019-01',

  /** Estado que muda sem ser tempo — um único ponto de edição. */
  disponivel: true,
  prazoRespostaH: 24,

  contato: {
    email: 'brunogaliz2@gmail.com',
    telefoneE164: '5567981142011',
    linkedin: 'https://linkedin.com/in/brunogaliz',
    github: 'https://github.com/bgaliz',
    site: 'https://bgaliz.github.io',
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   EXPERIÊNCIAS
   A ordem aqui é irrelevante: `tempo.js` ordena por data. Acrescentar um
   cargo não exige tocar em nada além deste array e do trecho no HTML.
   ══════════════════════════════════════════════════════════════════════════ */

export const EXPERIENCIAS = [
  {
    id: 'az', empresa: 'AZ Tecnologia em Gestão',
    inicio: '2025-08', fim: null,        // ⇒ "atual" / "current" derivado
    dominio: 'governo', contaComoDev: true, recorte: true,
    stack: ['vue', 'java', 'spring', 'maven', 'jpaquery', 'postgres', 'oracle', 'mongo', 'docker', 'grafana'],
  },
  {
    id: 'easy', empresa: 'Easy Imóveis',
    inicio: '2024-08', fim: '2024-09',
    dominio: 'imobiliario', contaComoDev: true, recorte: false,
    stack: ['nuxt', 'vue', 'ts', 'tailwind', 'shadcn', 'php', 'docker', 'bootstrap'],
  },
  {
    id: 'conexa', empresa: 'Conexa Saúde',
    inicio: '2022-09', fim: '2024-06',
    dominio: 'saude', contaComoDev: true, recorte: true,
    stack: ['react', 'vue', 'ts', 'jsp', 'git', 'scrum'],
  },
  {
    id: 'calango', empresa: 'Calango Doido',
    inicio: '2022-02', fim: '2023-01',
    // Freelance: entra na trajetória, fica fora dos recortes — ver decisão 7.
    dominio: 'web3', contaComoDev: true, recorte: false,
    stack: ['next', 'react', 'ts', 'web3', 'metamask', 'tailwind', 'figma', 'vercel'],
  },
  {
    id: 'sgi', empresa: 'SGI · Governo de MS',
    inicio: '2020-08', fim: '2022-06',
    dominio: 'governo', contaComoDev: true, recorte: false,
    stack: ['angular', 'react', 'ionic', 'node', 'sequelize', 'ts', 'jest', 'sqlserver', 'figma'],
  },
  {
    id: 'reduza', empresa: 'Reduza',
    inicio: '2019-01', fim: '2020-07',
    dominio: 'ecommerce', contaComoDev: true, recorte: false,
    stack: ['angular', 'sass', 'ts', 'jquery', 'node', 'express', 'mongo', 'redis'],
  },
  {
    id: 'unisys', empresa: 'Unisys',
    inicio: '2018-02', fim: '2019-01',
    dominio: 'ti',
    contaComoDev: false,                 // não infla o tempo de carreira
    recorte: false, discreto: true,
    stack: [],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   FORMAÇÃO, IDIOMAS E CURSOS
   ══════════════════════════════════════════════════════════════════════════ */

export const FORMACAO = [
  { id: 'ucdb', instituicao: 'Universidade Católica Dom Bosco',
    inicio: '2014-02', fim: '2018-12', principal: true },
  { id: 'hightech', instituicao: 'High Tech',
    inicio: '2018-01', fim: '2018-12', principal: false },
];

export const IDIOMAS = [
  { id: 'pt', cursos: [] },
  {
    id: 'en',
    desde: '2011-01',                    // alimenta o "há N anos" dinâmico
    cursos: [
      { nome: 'Wizard', inicio: '2011-01', fim: '2013-12' },
      { nome: 'inFlux', inicio: '2021-01', fim: '2023-12' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   TECNOLOGIAS — alimenta a seção 004. DOIS eixos, e nenhum deles é nota.

   `camada` AGRUPA. É o corte que um cliente pergunta ("você faz meu
   back-end?"), e o único que os cartões de cargo não dão:
     front   → interface de produto
     back    → API, regra de negócio e o banco
     entrega → do commit ao ar, e o que olhar quando cai
     legado  → sistema que não pode parar (metade do trabalho em governo
               e saúde — é força, não débito)
     margem  → fora da rotina, mas rendeu produto publicado

   `grupo` ORDENA dentro da camada, e é honestidade calibrada, não vaidade:
     diario    → uso todo dia, discuto em profundidade
     entrego   → entrego bem quando o projeto pede
     historico → já entreguei com, não é o que uso hoje

   Por que ordena em vez de aparecer: pôr o mais recente na frente comunica
   "onde eu moro" sem escrever número nenhum. Já houve aqui uma fileira de
   pontos contando projetos, e todo mundo leu como nota de 1 a 5 — qualquer
   marcador ordinal vai ser lido assim. O nível vive na prosa do index.html.

   `EXPERIENCIAS[].stack` referencia estes ids — é o que torna a stack
   verificável em vez de declaratória, e é em Trajetória que essa prova é
   mostrada, cargo por cargo.
   ══════════════════════════════════════════════════════════════════════════ */

export const TECNOLOGIAS = [
  { id: 'vue',       nome: 'Vue.js',       camada: 'front',   grupo: 'diario' },
  { id: 'ts',        nome: 'TypeScript',   camada: 'front',   grupo: 'diario' },
  { id: 'react',     nome: 'React',        camada: 'front',   grupo: 'entrego' },
  { id: 'next',      nome: 'Next.js',      camada: 'front',   grupo: 'entrego' },
  { id: 'nuxt',      nome: 'Nuxt.js',      camada: 'front',   grupo: 'entrego' },
  { id: 'tailwind',  nome: 'Tailwind CSS', camada: 'front',   grupo: 'entrego' },
  { id: 'shadcn',    nome: 'shadcn/ui',    camada: 'front',   grupo: 'entrego' },
  { id: 'sass',      nome: 'Sass',         camada: 'front',   grupo: 'entrego' },
  { id: 'figma',     nome: 'Figma',        camada: 'front',   grupo: 'entrego' },

  { id: 'node',      nome: 'Node.js',      camada: 'back',    grupo: 'diario' },
  { id: 'postgres',  nome: 'PostgreSQL',   camada: 'back',    grupo: 'diario' },
  { id: 'java',      nome: 'Java 11',      camada: 'back',    grupo: 'entrego' },
  { id: 'spring',    nome: 'Spring Boot',  camada: 'back',    grupo: 'entrego' },
  { id: 'maven',     nome: 'Maven',        camada: 'back',    grupo: 'entrego' },
  { id: 'jpaquery',  nome: 'JPAQuery',     camada: 'back',    grupo: 'entrego' },
  { id: 'express',   nome: 'Express.js',   camada: 'back',    grupo: 'entrego' },
  { id: 'mongo',     nome: 'MongoDB',      camada: 'back',    grupo: 'entrego' },
  { id: 'oracle',    nome: 'OracleDB',     camada: 'back',    grupo: 'entrego' },
  { id: 'sqlserver', nome: 'SQL Server',   camada: 'back',    grupo: 'historico' },
  { id: 'redis',     nome: 'Redis',        camada: 'back',    grupo: 'historico' },

  { id: 'git',       nome: 'Git',          camada: 'entrega', grupo: 'diario' },
  { id: 'docker',    nome: 'Docker',       camada: 'entrega', grupo: 'diario' },
  { id: 'scrum',     nome: 'Scrum',        camada: 'entrega', grupo: 'diario' },
  { id: 'jest',      nome: 'Jest',         camada: 'entrega', grupo: 'entrego' },
  { id: 'grafana',   nome: 'Grafana',      camada: 'entrega', grupo: 'entrego' },
  { id: 'vercel',    nome: 'Vercel',       camada: 'entrega', grupo: 'entrego' },

  { id: 'jsp',       nome: 'JSP',          camada: 'legado',  grupo: 'historico' },
  { id: 'angular',   nome: 'Angular',      camada: 'legado',  grupo: 'historico' },
  { id: 'jquery',    nome: 'jQuery',       camada: 'legado',  grupo: 'historico' },
  { id: 'php',       nome: 'PHP',          camada: 'legado',  grupo: 'historico' },
  { id: 'bootstrap', nome: 'Bootstrap',    camada: 'legado',  grupo: 'historico' },
  { id: 'sequelize', nome: 'Sequelize',    camada: 'legado',  grupo: 'historico' },

  // Não é legado: rendeu app nas duas lojas e um jogo em produção. Chamar
  // de legado seria mentira; esconder jogaria fora alcance real.
  { id: 'ionic',     nome: 'Ionic',        camada: 'margem',  grupo: 'historico' },
  { id: 'web3',      nome: 'Web3.js',      camada: 'margem',  grupo: 'historico' },
  { id: 'metamask',  nome: 'MetaMask',     camada: 'margem',  grupo: 'historico' },
];

/** Rótulos de domínio — a CONTAGEM de domínios é derivada de EXPERIENCIAS. */
export const DOMINIOS = {
  governo:     { pt: 'governo',     en: 'government' },
  saude:       { pt: 'saúde',       en: 'healthcare' },
  web3:        { pt: 'Web3',        en: 'Web3' },
  ecommerce:   { pt: 'e-commerce',  en: 'e-commerce' },
  imobiliario: { pt: 'imobiliário', en: 'real estate' },
  ti:          { pt: 'TI',          en: 'IT' },
};
