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

import { neon } from '@neondatabase/serverless';
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

export const sql = conexao ? neon(conexao) : () => {
  throw new Error(
    'Nenhuma string de conexão no ambiente. Esperado DATABASE_URL (ou ' +
    'POSTGRES_URL). Conecte o banco em Storage, confirme que ele está ligado ' +
    'a ESTE projeto, e refaça o deploy — variável nova só vale em build novo.'
  );
};

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

/** Classificação grosseira e suficiente — não é fingerprinting. */
export function dispositivoDe(ua = '') {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
  if (/bot|crawler|spider|crawling|preview|facebookexternalhit|WhatsApp/i.test(ua)) return 'bot';
  return 'desktop';
}

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
  pronto = true;
}

export const json = (dados, status = 200, extra = {}) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra },
  });
