/**
 * POST /api/sair — encerra a sessão do painel
 * Apaga o cookie no navegador. Sem estado no servidor: a sessão expira
 * sozinha em 12 h, e trocar PAINEL_SEGREDO (ou o token) derruba todas.
 */

import { json } from './_lib/db.js';
import { cookieDeSaida, mesmaOrigem } from './_lib/sessao.js';
import { adaptar } from './_lib/adaptador.js';

async function handler(request) {
  if (request.method !== 'POST') return json({ erro: 'Método não permitido' }, 405);
  if (!mesmaOrigem(request)) return json({ erro: 'Origem não autorizada' }, 403);
  return json({ ok: true }, 200, { 'Cache-Control': 'no-store', 'Set-Cookie': cookieDeSaida() });
}

export default adaptar(handler);
