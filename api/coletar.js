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
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  sql, garantirEsquema, corsPara, origemPermitida,
  hashVisitante, geoDe, ipDe, dispositivoDe, hostDe,
} from './_lib/db.js';
import { adaptar } from './_lib/adaptador.js';

const EVENTOS = new Set(['pageview', 'secao', 'clique', 'saida']);
const corta = (t, n) => (typeof t === 'string' ? t.slice(0, n) : null);

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
  if (!EVENTOS.has(evento)) return new Response('Evento desconhecido', { status: 400, headers: cors });

  const ua = request.headers.get('user-agent') || '';
  const dispositivo = dispositivoDe(ua);

  // Robô de indexação e prévia de link não são visita de gente.
  if (dispositivo === 'bot') return new Response(null, { status: 204, headers: cors });

  try {
    await garantirEsquema();

    const { pais, cidade } = geoDe(request.headers);
    const duracao = Number.isFinite(corpo.duracao_ms)
      ? Math.min(Math.max(0, Math.round(corpo.duracao_ms)), 4 * 60 * 60 * 1000)
      : null;

    await sql`
      insert into visitas
        (visitante, sessao, ref, referrer_host, pais, cidade, dispositivo, idioma, evento, detalhe, duracao_ms)
      values (
        ${hashVisitante(ipDe(request.headers), ua)},
        ${corta(corpo.sessao, 64) || 'sem-sessao'},
        ${corta(corpo.ref, 80)},
        ${hostDe(corpo.referrer)},
        ${pais}, ${cidade}, ${dispositivo},
        ${corta(corpo.idioma, 12)},
        ${evento},
        ${corta(corpo.detalhe, 80)},
        ${duracao}
      )`;
  } catch (e) {
    // Falha de banco não pode virar erro visível para quem está visitando.
    console.error('[coletar]', e?.message);
  }

  return new Response(null, { status: 204, headers: cors });
}

/* A Vercel invoca com (req, res) neste projeto; o handler acima é web. */
export default adaptar(handler);
