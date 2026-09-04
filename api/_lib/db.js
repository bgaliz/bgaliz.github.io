/**
 * BANCO E UTILITÁRIOS COMPARTILHADOS
 * ══════════════════════════════════════════════════════════════════════════
 * Neon Postgres pelo driver serverless (HTTP, sem pool para manter aberto).
 *
 * O ENDEREÇO IP NUNCA É GRAVADO. Ele existe apenas em memória, por um
 * instante, para compor um hash com um sal que muda todo dia. Isso permite
 * contar visitantes únicos sem armazenar dado pessoal, e como o sal roda
 * diariamente, o hash de hoje não pode ser ligado ao de ontem nem revertido.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { createHash } from 'node:crypto';

/* A conexão não pode estourar na IMPORTAÇÃO do módulo, e é isso que
   `neon(undefined)` faz: lança na hora, antes de qualquer handler existir. O
   try/catch dos dois endpoints nunca chega a rodar, e a Vercel responde
   FUNCTION_INVOCATION_FAILED — um 500 sem uma palavra sobre a causa. Quem
   estiver depurando isso às onze da noite merece coisa melhor.

   Adiando o erro para a primeira consulta, o catch de cada handler assume:
   `/api/painel` passa a devolver o motivo por escrito e `/api/coletar`
   segue falhando em silêncio, como tem de ser.

   Os quatro nomes existem porque a variável muda conforme por onde o banco
   entrou: a integração Neon do Marketplace cria DATABASE_URL, a antiga
   Vercel Postgres criava POSTGRES_URL, e as duas oferecem uma variante sem
   pool. Aceitar os quatro custa três linhas e evita um deploy inteiro
   perdido em "mas eu criei o banco". */
const conexao = process.env.DATABASE_URL
             || process.env.POSTGRES_URL
             || process.env.DATABASE_URL_UNPOOLED
             || process.env.POSTGRES_URL_NON_POOLING;

/* O driver entra por importação DINÂMICA, e não por `import` no topo, pela
   mesma razão que a conexão é adiada: em ESM, importação estática que falha
   derruba o módulo inteiro antes de o handler existir, e nem o try/catch dele
   nem a guarda acima chegam a rodar — a Vercel responde
   FUNCTION_INVOCATION_FAILED e não conta o porquê. Foi exatamente o que
   aconteceu: adiar só o `neon()` não bastou, porque quem estourava era a
   linha de import.

   Dinâmico, qualquer falha na carga do driver (pacote ausente no build,
   runtime incompatível) vira erro CAPTURÁVEL: `/api/painel` devolve o motivo
   por escrito e `/api/coletar` continua em silêncio. */
let cliente = null;

async function conectar() {
  if (cliente) return cliente;
  if (!conexao) {
    throw new Error(
      'Nenhuma string de conexão no ambiente. Esperado DATABASE_URL (ou ' +
      'POSTGRES_URL). Conecte o banco em Storage, confirme que ele está ligado ' +
      'a ESTE projeto, e refaça o deploy — variável nova só vale em build novo.'
    );
  }
  let neon;
  try {
    ({ neon } = await import('@neondatabase/serverless'));
  } catch (e) {
    throw new Error(
      `Não foi possível carregar '@neondatabase/serverless' no runtime: ${e?.message}. ` +
      'Confirme que ele está em dependencies (não devDependencies) e que o build ' +
      'da Vercel instalou os pacotes.'
    );
  }
  cliente = neon(conexao);
  return cliente;
}

/** Mantém a forma de template marcado: `await sql\`select 1\``. */
export const sql = async (textos, ...valores) => (await conectar())(textos, ...valores);

/* Comando sem parâmetro nenhum, para o punhado de casos em que o Postgres não
   aceita $1 — CREATE VIEW é o único aqui. `query()` é a forma que o próprio
   driver oferece para isso; o template marcado não serve, porque tudo que ele
   interpola vira placeholder, e placeholder é justamente o que o CREATE VIEW
   recusa. Nada vindo de fora entra por aqui. */
export const sqlDireto = async (texto) => (await conectar()).query(texto);

/** Origens autorizadas a enviar eventos. */
const ORIGENS = [
  'https://bgaliz.github.io',
  'http://localhost:8000',
  'http://localhost:8765',
];

export function corsPara(origem) {
  const permitida = ORIGENS.includes(origem) ? origem : ORIGENS[0];
  return {
    'Access-Control-Allow-Origin': permitida,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export const origemPermitida = (o) => !o || ORIGENS.includes(o);

/**
 * Identificador diário e irreversível do visitante.
 * O sal combina um segredo do ambiente com a data — troca de dia, troca o
 * espaço de hashes.
 */
export function hashVisitante(ip, userAgent) {
  const dia = new Date().toISOString().slice(0, 10);
  const segredo = process.env.SAL_VISITANTE || 'sal-de-desenvolvimento';
  return createHash('sha256')
    .update(`${ip || '?'}|${userAgent || '?'}|${dia}|${segredo}`)
    .digest('hex')
    .slice(0, 32);
}

/** Geolocalização vinda dos headers da própria Vercel — sem API externa. */
export function geoDe(headers) {
  return {
    pais: headers.get('x-vercel-ip-country') || null,
    cidade: decodeURIComponent(headers.get('x-vercel-ip-city') || '') || null,
  };
}

export function ipDe(headers) {
  const encaminhado = headers.get('x-forwarded-for');
  return encaminhado ? encaminhado.split(',')[0].trim()
                     : headers.get('x-real-ip') || null;
}

/* Robô moderno não se anuncia como robô: carrega uma cadeia de navegador
   inteira e só entrega o nome no fim. O Googlebot de celular manda
   "...Android 6.0.1...Mobile Safari...(compatible; Googlebot/2.1...)" e a
   prévia do WhatsApp manda "WhatsApp/2.24 Android". Testando aparelho antes
   de robô — como estava — os dois casavam em `Android` e entravam no painel
   como visita de gente num celular. A ordem aqui é o conserto: robô PRIMEIRO,
   sempre. */
const ROBO = new RegExp([
  'bot', 'crawler', 'spider', 'crawling', 'scraper', 'preview',
  'facebookexternalhit', 'WhatsApp', 'Slackbot', 'TelegramBot', 'Discordbot',
  'LinkedInBot', 'Twitterbot', 'Applebot', 'SkypeUriPreview', 'Embedly',
  'HeadlessChrome', 'Lighthouse', 'PhantomJS', 'Puppeteer', 'Playwright',
  'python-requests', 'aiohttp', 'httpx', 'Go-http-client', 'okhttp',
  'node-fetch', 'axios', 'curl', 'Wget', 'libwww', 'Java/', 'Apache-HttpClient',
  'monitoring', 'uptime', 'pingdom', 'statuscake', 'newrelic', 'datadog',
].join('|'), 'i');

/** Classificação grosseira e suficiente — não é fingerprinting. */
export function dispositivoDe(ua = '') {
  if (!ua || ROBO.test(ua)) return 'bot';
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/* Endereços que são datacenter, não cidade. Boydton tem 400 habitantes e o
   East US da Azure; Des Moines e Council Bluffs são o us-central1 do Google;
   Prineville e Clonee são da Meta. Ninguém "visita um portfólio" de lá — é de
   onde saem os robôs que passaram pela peneira de user-agent acima, e é o
   único sinal que sobra depois que eles se vestem de navegador.

   A lista é curta de propósito: só entra lugar cuja população não explica o
   tráfego. Cidade grande de verdade (San Jose, Chicago, Dublin) fica fora,
   mesmo hospedando nuvem — descartar um recrutador real custa mais caro do
   que deixar passar um robô. */
export const CIDADES_NUVEM = [
  'boydton', 'des moines', 'council bluffs', 'the dalles', 'prineville',
  'clonee', 'papillion', 'moncks corner', 'quincy', 'widows creek',
  'lenoir', 'mayes county', 'pryor', 'new albany', 'huntsville',
  'eemshaven', 'st ghislain', 'saint-ghislain', 'hamina', 'fredericia',
];

/** Só o host do referrer: a URL completa não acrescenta nada e expõe mais. */
export function hostDe(referrer) {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, '');
    return h === 'bgaliz.github.io' ? null : h;   // navegação interna não é origem
  } catch (e) { return null; }
}

let pronto = false;

/** Cria o esquema uma vez por instância fria. */
export async function garantirEsquema() {
  if (pronto) return;
  await sql`
    create table if not exists visitas (
      id            bigserial primary key,
      criado_em     timestamptz not null default now(),
      visitante     text not null,
      sessao        text not null,
      ref           text,
      referrer_host text,
      pais          text,
      cidade        text,
      dispositivo   text,
      idioma        text,
      evento        text not null,
      detalhe       text,
      duracao_ms    integer
    )`;
  await sql`create index if not exists visitas_criado_em_idx on visitas (criado_em desc)`;
  await sql`create index if not exists visitas_ref_idx        on visitas (ref)`;
  await sql`create index if not exists visitas_evento_idx     on visitas (evento)`;

  /* A vista existe para que o painel não precise repetir a regra em nove
     consultas — e para que ela valha RETROATIVAMENTE. O acerto de user-agent
     acima só classifica o que chegar de hoje em diante; o que já está gravado
     como "desktop" continua gravado assim, e é a cidade que o desmente.

     A lista entra no texto da definição em vez de vir por parâmetro porque
     CREATE VIEW não aceita $1. É constante do próprio código, sem nada vindo
     de fora, e as aspas são checadas antes de concatenar. */
  const lista = CIDADES_NUVEM
    .map((c) => `'${String(c).replace(/'/g, "''")}'`)
    .join(', ');

  await sqlDireto(`
    create or replace view visitas_gente as
      select * from visitas
      where dispositivo is distinct from 'bot'
        and lower(coalesce(cidade, '')) not in (${lista})`);

  pronto = true;
}

export const json = (dados, status = 200, extra = {}) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra },
  });
