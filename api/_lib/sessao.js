/**
 * SESSÃO DO PAINEL
 * ══════════════════════════════════════════════════════════════════════════
 * O token do painel morava no localStorage, onde qualquer script da página
 * consegue lê-lo. Agora ele só atravessa a rede uma vez, no POST de login, e
 * o navegador passa a carregar um cookie que JavaScript nenhum enxerga:
 *
 *   painel_sessao=<expira>.<nonce>.<hmac>; HttpOnly; Secure; SameSite=Strict
 *
 * O HMAC é feito com PAINEL_SEGREDO. Enquanto ele não existir no ambiente, a
 * chave deriva do próprio PAINEL_TOKEN — o painel funciona desde o primeiro
 * deploy, e trocar o token derruba todas as sessões abertas, que é exatamente
 * o que se quer quando um token vaza.
 *
 * Toda comparação de segredo passa por `iguais`: `!==` para no primeiro
 * caractere diferente, e o tempo de resposta conta quantos acertaram.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const NOME = 'painel_sessao';
const DURACAO_S = 12 * 60 * 60;

const resumo = (t) => createHash('sha256').update(String(t)).digest();

/** Comparação em tempo constante. Os dois lados viram SHA-256 antes, para
 *  que nem o comprimento do segredo vaze pelo tempo. Vazio nunca é igual. */
export function iguais(a, b) {
  if (!a || !b) return false;
  return timingSafeEqual(resumo(a), resumo(b));
}

function chave() {
  if (process.env.PAINEL_SEGREDO) return process.env.PAINEL_SEGREDO;
  if (process.env.PAINEL_TOKEN) return resumo(`sessao|${process.env.PAINEL_TOKEN}`).toString('hex');
  return null;
}

const assinar = (k, corpo) => createHmac('sha256', k).update(corpo).digest('base64url');

/** Cabeçalho Set-Cookie de uma sessão nova, ou null sem chave configurada. */
export function cookieDeEntrada() {
  const k = chave();
  if (!k) return null;
  const expira = Math.floor(Date.now() / 1000) + DURACAO_S;
  const corpo = `${expira}.${randomBytes(12).toString('base64url')}`;
  return `${NOME}=${corpo}.${assinar(k, corpo)}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${DURACAO_S}`;
}

export const cookieDeSaida = () =>
  `${NOME}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

function sessaoValida(request) {
  const k = chave();
  if (!k) return false;

  const bruto = (request.headers.get('cookie') || '')
    .split(/;\s*/)
    .find((c) => c.startsWith(`${NOME}=`));
  if (!bruto) return false;

  const [expira, nonce, assinatura] = bruto.slice(NOME.length + 1).split('.');
  if (!expira || !nonce || !assinatura) return false;
  if (!(Number(expira) > Date.now() / 1000)) return false;

  return iguais(assinatura, assinar(k, `${expira}.${nonce}`));
}

/** Cookie de sessão OU `Authorization: Bearer <PAINEL_TOKEN>` (para curl e
 *  scripts). Os dois caminhos passam pela comparação em tempo constante. */
export function autorizado(request) {
  if (sessaoValida(request)) return true;
  const enviado = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return iguais(enviado, process.env.PAINEL_TOKEN);
}

/** O pedido veio da própria origem? Login e logout só aceitam isso. */
export function mesmaOrigem(request) {
  const origem = request.headers.get('origin');
  if (!origem) return false;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  try {
    const o = new URL(origem);
    return o.host === host && (o.protocol === 'https:' || o.hostname === 'localhost');
  } catch (e) {
    return false;
  }
}
