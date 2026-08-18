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

export const sql = neon(process.env.DATABASE_URL);

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
