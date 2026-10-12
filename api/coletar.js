/**
 * POST /api/coletar — registra um evento de visita
 * ══════════════════════════════════════════════════════════════════════════
 * Responde 204 sempre que o pedido for aceitável, mesmo se a gravação
 * falhar: o cliente não tem o que fazer com um erro daqui, e um 500 só
 * geraria ruído no console de quem está visitando o portfólio.
 *
 * O corpo chega como text/plain de propósito — é o que permite o
 * navigator.sendBeacon funcionar no pagehide sem preflight CORS, que não
 * teria tempo de completar enquanto a aba fecha.
 *
 * Tudo que vem do navegador é validado por lista: evento conhecido, detalhe
 * no formato daquele evento, página e versão em formato fixo. Um campo fora
 * do formato vira nulo, nunca vira texto livre gravado no banco.
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  sql, garantirEsquema, corsPara, origemPermitida,
  hashVisitante, geoDe, ipDe, dispositivoDe, hostDe,
} from './_lib/db.js';
import { adaptar } from './_lib/adaptador.js';

const ID = /^[a-z0-9-]{1,40}$/;
const RECORTE = /^[a-z0-9:,.-]{1,80}$/;

/** Formato aceito do `detalhe`, por evento. `null` = o evento não tem detalhe. */
const DETALHE = {
  pageview: null,
  saida: null,
  interacao: null,
  secao: ID,
  clique: ID,
  profundidade: /^(25|50|75|100)$/,
  abrir: RECORTE,      // aprofundamento ou projeto aberto
  relatorio: RECORTE,  // colunas e filtro do "Monte o relatório de mim"
  copiar: ID,          // resumo, e-mail, currículo
};

const PAGINA = /^\/[a-z0-9/._-]{0,60}$/;
const VERSAO = /^\d{4}-\d{2}[a-z0-9-]{0,12}$/;
const LIMITE_POR_HORA = 120;
const TRINTA_MIN = 30 * 60 * 1000;

const corta = (t, n) => (typeof t === 'string' ? t.slice(0, n) : null);
const casa = (re, t) => (typeof t === 'string' && re.test(t) ? t : null);
const ms = (n) => (Number.isFinite(n) ? Math.min(Math.max(0, Math.round(n)), TRINTA_MIN) : null);

async function handler(request) {
  const origem = request.headers.get('origin');
  const cors = corsPara(origem);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return new Response('Método não permitido', { status: 405, headers: cors });
  if (!origemPermitida(origem)) return new Response('Origem não autorizada', { status: 403, headers: cors });

  let corpo;
  try {
    corpo = JSON.parse(await request.text());
  } catch (e) {
    return new Response('Corpo inválido', { status: 400, headers: cors });
  }

  const evento = corpo?.evento;
  if (!Object.hasOwn(DETALHE, evento)) return new Response('Evento desconhecido', { status: 400, headers: cors });

  const ua = request.headers.get('user-agent') || '';
  const dispositivo = dispositivoDe(ua);

  // Robô de indexação e prévia de link não são visita de gente.
  if (dispositivo === 'bot') return new Response(null, { status: 204, headers: cors });

  try {
    await garantirEsquema();

    const visitante = hashVisitante(ipDe(request.headers), ua);

    /* Teto por visitante: uma visita real gera algumas dezenas de eventos.
       Passar de 120 numa hora é laço de script, e não deve encher o banco. */
    const [{ n }] = await sql`
      select count(*)::int as n from visitas
      where visitante = ${visitante} and criado_em > now() - interval '1 hour'`;
    if (n >= LIMITE_POR_HORA) return new Response(null, { status: 204, headers: cors });

    const { pais, cidade } = geoDe(request.headers);
    const formato = DETALHE[evento];

    await sql`
      insert into visitas
        (visitante, sessao, ref, referrer_host, pais, cidade, dispositivo, idioma,
         evento, detalhe, duracao_ms, pagina, versao, ativo_ms)
      values (
        ${visitante},
        ${corta(corpo.sessao, 64) || 'sem-sessao'},
        ${corta(corpo.ref, 80)},
        ${hostDe(corpo.referrer)},
        ${pais}, ${cidade}, ${dispositivo},
        ${corta(corpo.idioma, 12)},
        ${evento},
        ${formato ? casa(formato, corpo.detalhe) : null},
        ${ms(corpo.duracao_ms)},
        ${casa(PAGINA, corpo.pagina)},
        ${casa(VERSAO, corpo.versao)},
        ${evento === 'saida' ? ms(corpo.ativo_ms) : null}
      )`;
  } catch (e) {
    // Falha de banco não pode virar erro visível para quem está visitando.
    console.error('[coletar]', e?.message);
  }

  return new Response(null, { status: 204, headers: cors });
}

/* A Vercel invoca com (req, res) neste projeto; o handler acima é web. */
export default adaptar(handler);
