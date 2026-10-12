/**
 * POST /api/entrar — troca o token do painel por um cookie de sessão
 * ══════════════════════════════════════════════════════════════════════════
 * O token atravessa a rede uma vez, aqui, e nunca mais: daí em diante o
 * navegador carrega um cookie HttpOnly que nenhum script da página lê.
 *
 * Só aceita pedido da própria origem (o painel mora no mesmo domínio da API).
 * Dez falhas no dia bloqueiam o IP até o dia virar, e toda falha custa 600 ms:
 * adivinhar o token na força bruta deixa de ser viável.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { garantirEsquema, hashVisitante, ipDe, json, falhasDeHoje, registrarFalha, LIMITE_FALHAS } from './_lib/db.js';
import { iguais, cookieDeEntrada, mesmaOrigem } from './_lib/sessao.js';
import { adaptar } from './_lib/adaptador.js';

const SEM_CACHE = { 'Cache-Control': 'no-store' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function handler(request) {
  if (request.method !== 'POST') return json({ erro: 'Método não permitido' }, 405, SEM_CACHE);
  if (!mesmaOrigem(request)) return json({ erro: 'Origem não autorizada' }, 403, SEM_CACHE);
  if (!process.env.PAINEL_TOKEN) return json({ erro: 'PAINEL_TOKEN não configurado no ambiente' }, 500, SEM_CACHE);

  let token = '';
  try { token = String(JSON.parse(await request.text())?.token || ''); } catch (e) { /* corpo inválido = token vazio */ }

  let chave;
  try {
    await garantirEsquema();
    chave = `login|${hashVisitante(ipDe(request.headers), '')}`;
    if (await falhasDeHoje(chave) >= LIMITE_FALHAS) {
      return json({ erro: 'Tentativas demais hoje. Tente amanhã.' }, 429, SEM_CACHE);
    }
  } catch (e) {
    console.error('[entrar]', e?.message);
    return json({ erro: 'Falha ao validar' }, 500, SEM_CACHE);
  }

  if (!iguais(token, process.env.PAINEL_TOKEN)) {
    await espera(600);
    try { await registrarFalha(chave); } catch (e) { console.error('[entrar]', e?.message); }
    return json({ erro: 'Token incorreto.' }, 401, SEM_CACHE);
  }

  const cookie = cookieDeEntrada();
  if (!cookie) return json({ erro: 'Sessão indisponível' }, 500, SEM_CACHE);
  return json({ ok: true }, 200, { ...SEM_CACHE, 'Set-Cookie': cookie });
}

export default adaptar(handler);
