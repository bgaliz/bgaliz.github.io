/**
 * FONTE ÚNICA DE VERDADE: ESTRUTURA E DATAS
 * ══════════════════════════════════════════════════════════════════════════
 * Toda data do projeto vive aqui e em nenhum outro lugar. Nenhum número
 * temporal é escrito à mão: slots `data-din` no HTML, calculados por
 * `tempo.js` + `dinamico.js`, e injetados no build por `construir.mjs`.
 *
 * O TEXTO vive em `conteudo/curriculo.mjs` (PT e EN lado a lado). O build
 * junta os dois e gera tudo: páginas PT e EN, JSON-LD, JSON Resume, currículo
 * em texto puro, llms.txt e os PDFs. Uma fonte, todas as saídas, para que as
 * versões nunca mais se contradigam como os três currículos se contradiziam.
 *
 * Formato de data: 'AAAA-MM'. `fim: null` significa "em curso": o rótulo
 * "atual"/"current" é DERIVADO disso, nunca escrito.
 *
 * ── DECISÕES DE RECONCILIAÇÃO DOS 3 CURRÍCULOS ───────────────────────────
 * 1. MÉTRICAS REMOVIDAS. Os currículos se contradizem entre si (10.000 vs
 *    50.000 usuários; 10% vs 40%; SEO +30% vs cupons +40%). Número que muda
 *    conforme o documento não sobrevive à pergunta "como você mediu?". Só
 *    volta o que o Bruno confirmar e souber explicar.
 * 2. E-MAIL: brunogaliz2@gmail.com (documentos mais recentes).
 * 3. INÍCIO DA GRADUAÇÃO: fev/2014 (mais específico que o jan/2014 do LinkedIn).
 * 4. UNISYS entra com `contaComoDev: false`: mostra a progressão TI → dev sem
 *    inflar o tempo de carreira.
 * 5. IDADE fica fora: data de nascimento não existe em nenhum dos currículos.
 * 6. LACUNA de 10 meses (out/2024 → jul/2025), mais 1 mês em jul/2024. Fica
 *    visível na régua da trajetória, sem texto (decisão do Bruno, out/2026).
 * 7. CALANGO DOIDO foi freelance em paralelo a SGI e Conexa: o tempo de
 *    carreira é UNIÃO de intervalos, não soma (81 meses reais, não 91).
 *
 * ── AUDITORIA DE STACK (out/2026) ────────────────────────────────────────
 * Os robôs de recrutador (Gupy, LinkedIn, Eightfold, SeekOut) calculam tempo
 * por tecnologia a partir das datas de cada cargo. Antes desta auditoria, Git
 * só constava na Conexa, e o cálculo saía "Git: 1 ano e 10 meses". O Bruno
 * confirmou: Git, Scrum e APIs REST em todos os cargos de dev; na AZ também
 * TypeScript, CI/CD e criação de APIs REST.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const PERFIL = {
  nome: 'Bruno Galiz',
  nomeCompleto: 'Bruno Galiz de Oliveira',
  iniciais: 'BGO',

  /** Primeiro cargo de desenvolvedor. Base do "desde 2019". */
  inicioCarreira: '2019-01',

  /** Estado que muda sem ser tempo: um único ponto de edição. */
  disponivel: true,

  contato: {
    email: 'brunogaliz2@gmail.com',
    telefoneE164: '5567981142011',
    linkedin: 'https://www.linkedin.com/in/brunogaliz',
    github: 'https://github.com/bgaliz',
    site: 'https://bgaliz.github.io',
  },

  local: { cidade: 'Campo Grande', estado: 'MS', pais: 'BR', fuso: 'America/Campo_Grande' },
};

/* Práticas que o Bruno confirmou em todos os cargos de desenvolvimento. */
const SEMPRE = ['git', 'scrum', 'rest'];

/* ══════════════════════════════════════════════════════════════════════════
   EXPERIÊNCIAS
   A ordem aqui é irrelevante: `tempo.js` ordena por data. A principal entrega
   de cada cargo (o que o robô pesa primeiro) está em conteudo/curriculo.mjs.
   `url` alimenta a prévia de link (metadados do site, como no WhatsApp).
   ══════════════════════════════════════════════════════════════════════════ */

export const EXPERIENCIAS = [
  {
    id: 'az', empresa: 'AZ Tecnologia em Gestão',
    inicio: '2025-08', fim: null,
    dominio: 'governo', contaComoDev: true, modalidade: 'remoto',
    stack: ['vue', 'ts', 'java', 'spring', 'maven', 'jpaquery', 'postgres', 'oracle',
            'mongo', 'docker', 'ci', 'grafana', ...SEMPRE],
  },
  {
    id: 'easy', empresa: 'Easy Imóveis',
    inicio: '2024-08', fim: '2024-09',
    dominio: 'imobiliario', contaComoDev: true, modalidade: 'remoto', freelance: true,
    stack: ['nuxt', 'vue', 'ts', 'tailwind', 'shadcn', 'php', 'docker', 'bootstrap', ...SEMPRE],
  },
  {
    id: 'conexa', empresa: 'Conexa Saúde',
    inicio: '2022-09', fim: '2024-06',
    dominio: 'saude', contaComoDev: true, modalidade: 'remoto',
    stack: ['react', 'vue', 'ts', 'js', 'jsp', 'legado', ...SEMPRE],
  },
  {
    id: 'calango', empresa: 'Calango Doido NFT',
    inicio: '2022-02', fim: '2023-01',
    dominio: 'web3', contaComoDev: true, modalidade: 'campoGrande', freelance: true,
    url: 'https://calango-doido.vercel.app',
    stack: ['next', 'react', 'ts', 'web3', 'metamask', 'tailwind', 'figma', 'vercel', ...SEMPRE],
  },
  {
    id: 'sgi', empresa: 'SGI, Governo de Mato Grosso do Sul',
    inicio: '2020-08', fim: '2022-06',
    dominio: 'governo', contaComoDev: true, modalidade: 'campoGrande',
    url: 'https://www.msdigital.ms.gov.br',
    stack: ['angular', 'react', 'ionic', 'mobile', 'node', 'sequelize', 'ts', 'js', 'jest',
            'sqlserver', 'figma', ...SEMPRE],
  },
  {
    id: 'reduza', empresa: 'Reduza',
    inicio: '2019-01', fim: '2020-07',
    dominio: 'ecommerce', contaComoDev: true, modalidade: 'campoGrande',
    url: 'https://www.reduza.com.br',
    stack: ['node', 'express', 'mongo', 'redis', 'angular', 'sass', 'ts', 'js', 'jquery',
            'html', 'seo', ...SEMPRE],
  },
  {
    id: 'unisys', empresa: 'Unisys',
    inicio: '2018-02', fim: '2019-01',
    dominio: 'ti', contaComoDev: false, discreto: true,
    stack: [],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   PROJETOS PESSOAIS
   Só os que o Bruno escolheu. Os repositórios do período da lacuna 2024–25
   ficam de fora por decisão dele. `privado: true` = código sob pedido; a
   prévia de link é montada da `url` pública, quando existe.
   ══════════════════════════════════════════════════════════════════════════ */

export const PROJETOS = [
  {
    id: 'copiloto', nome: 'Copiloto de Trading',
    inicio: '2026-08', fim: null, privado: true,
    stack: ['python', 'fastapi', 'pytest', 'docker', 'ia'],
  },
  {
    id: 'assetforge', nome: 'AssetForge',
    inicio: '2026-09', fim: null, privado: true,
    stack: ['python', 'fastapi', 'pytest', 'unity', 'ia'],
  },
  {
    id: 'eplay', nome: 'E-PLAY',
    inicio: '2026-07', fim: '2026-08', privado: true,
    url: 'https://e-connect-play.vercel.app',
    stack: ['react', 'ts', 'capacitor', 'supabase', 'postgres', 'tailwind', 'ci', 'ia'],
  },
  {
    id: 'cronometro', nome: 'Cronômetro de Oradores',
    inicio: '2026-05', fim: '2026-06', privado: true,
    url: 'https://cronometro-speacher.vercel.app',
    stack: ['react', 'ts', 'tailwind', 'vercel'],
  },
  {
    id: 'minin8n', nome: 'Mini n8n',
    inicio: '2025-07', fim: '2025-07', privado: false,
    // Fora do ar até o .env commitado no repositório público ser revogado e
    // removido: a prévia do GitHub mostrava o arquivo na listagem. Para
    // voltar, apague esta linha e rode coletar-previas + construir.
    oculto: true,
    url: 'https://github.com/bgaliz/Mini-n8n-Project-Front',
    repos: ['https://github.com/bgaliz/Mini-n8n-Project-Front', 'https://github.com/bgaliz/Mini-n8n-Project-Back'],
    stack: ['react', 'reactflow', 'tailwind', 'node', 'express', 'rest'],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   FORMAÇÃO E IDIOMAS
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
    desde: '2011-01',
    cursos: [
      { nome: 'Wizard', inicio: '2011-01', fim: '2013-12' },
      { nome: 'inFlux', inicio: '2021-01', fim: '2023-12' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   COMPETÊNCIAS
   `area` agrupa pelo corte que as vagas usam (amostra de 69 vagas da Gupy,
   out/2026). O "desde AAAA" e o "em uso" são DERIVADOS de cargos e projetos
   que citam o id: nada aqui é nota, e nada é escrito à mão.

   `semData: true` marcaria algo que o Bruno tem mas sem cargo atribuído:
   apareceria sem ano. Hoje não há nenhum (microsserviços, Kubernetes e
   nuvem ficaram de fora por decisão dele, out/2026).
   A ordem dentro de cada área é a ordem deste array.
   ══════════════════════════════════════════════════════════════════════════ */

export const AREAS = ['front', 'back', 'dados', 'entrega', 'mobile', 'ia', 'metodo'];

export const TECNOLOGIAS = [
  { id: 'vue',        nome: 'Vue.js',          area: 'front' },
  { id: 'react',      nome: 'React',           area: 'front' },
  { id: 'ts',         nome: 'TypeScript',      area: 'front' },
  { id: 'js',         nome: 'JavaScript',      area: 'front' },
  { id: 'angular',    nome: 'Angular',         area: 'front' },
  { id: 'next',       nome: 'Next.js',         area: 'front' },
  { id: 'nuxt',       nome: 'Nuxt.js',         area: 'front' },
  { id: 'tailwind',   nome: 'Tailwind CSS',    area: 'front' },
  { id: 'html',       nome: 'HTML e CSS',      en: 'HTML and CSS', area: 'front' },
  { id: 'sass',       nome: 'Sass',            area: 'front' },
  { id: 'shadcn',     nome: 'shadcn/ui',       area: 'front' },
  { id: 'reactflow',  nome: 'React Flow',      area: 'front' },
  { id: 'jquery',     nome: 'jQuery',          area: 'front' },
  { id: 'jsp',        nome: 'JSP',             area: 'front' },
  { id: 'figma',      nome: 'Figma',           area: 'front' },
  { id: 'web3',       nome: 'Web3.js',         area: 'front' },
  { id: 'metamask',   nome: 'MetaMask',        area: 'front' },

  { id: 'java',       nome: 'Java 11',         area: 'back' },
  { id: 'spring',     nome: 'Spring Boot',     area: 'back' },
  { id: 'rest',       nome: 'APIs REST',       en: 'REST APIs', area: 'back' },
  { id: 'node',       nome: 'Node.js',         area: 'back' },
  { id: 'express',    nome: 'Express',         area: 'back' },
  { id: 'python',     nome: 'Python',          area: 'back' },
  { id: 'fastapi',    nome: 'FastAPI',         area: 'back' },
  { id: 'jpaquery',   nome: 'JPAQuery',        area: 'back' },
  { id: 'maven',      nome: 'Maven',           area: 'back' },
  { id: 'sequelize',  nome: 'Sequelize',       area: 'back' },
  { id: 'php',        nome: 'PHP',             area: 'back' },

  { id: 'postgres',   nome: 'PostgreSQL',      area: 'dados' },
  { id: 'oracle',     nome: 'OracleDB',        area: 'dados' },
  { id: 'sqlserver',  nome: 'SQL Server',      area: 'dados' },
  { id: 'mongo',      nome: 'MongoDB',         area: 'dados' },
  { id: 'redis',      nome: 'Redis',           area: 'dados' },
  { id: 'supabase',   nome: 'Supabase',        area: 'dados' },

  { id: 'git',        nome: 'Git',             area: 'entrega' },
  { id: 'docker',     nome: 'Docker',          area: 'entrega' },
  { id: 'ci',         nome: 'CI/CD',           area: 'entrega' },
  { id: 'grafana',    nome: 'Grafana',         area: 'entrega' },
  { id: 'jest',       nome: 'Jest',            area: 'entrega' },
  { id: 'pytest',     nome: 'pytest',          area: 'entrega' },
  { id: 'vercel',     nome: 'Vercel',          area: 'entrega' },
  { id: 'bootstrap',  nome: 'Bootstrap',       area: 'front' },

  { id: 'ionic',      nome: 'Ionic',           area: 'mobile' },
  { id: 'capacitor',  nome: 'Capacitor',       area: 'mobile' },
  { id: 'mobile',     nome: 'Publicação na App Store e na Google Play', en: 'Publishing to the App Store and Google Play', area: 'mobile' },
  { id: 'unity',      nome: 'Unity',           area: 'mobile' },

  { id: 'ia',         nome: 'IA aplicada ao desenvolvimento', en: 'AI-assisted development', area: 'ia' },

  { id: 'scrum',      nome: 'Scrum',           area: 'metodo' },
  { id: 'legado',     nome: 'Migração de sistema legado', en: 'Legacy system migration', area: 'metodo' },
  { id: 'seo',        nome: 'SEO',             area: 'metodo' },
];

/** Rótulos de domínio. A CONTAGEM de domínios é derivada de EXPERIENCIAS. */
export const DOMINIOS = {
  governo:     { pt: 'governo',     en: 'government' },
  saude:       { pt: 'saúde',       en: 'healthcare' },
  web3:        { pt: 'Web3',        en: 'Web3' },
  ecommerce:   { pt: 'e-commerce',  en: 'e-commerce' },
  imobiliario: { pt: 'imobiliário', en: 'real estate' },
  ti:          { pt: 'TI',          en: 'IT' },
};
