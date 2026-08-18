/**
 * SONDA TEMPORÁRIA — APAGAR DEPOIS
 * ══════════════════════════════════════════════════════════════════════════
 * Existe para responder, numa única requisição, por que `coletar` e `painel`
 * quebram. Ela é escrita para NÃO poder quebrar pelos mesmos motivos:
 *
 *   · aceita as duas assinaturas de handler — web (Request) e Node (req,res)
 *     — e RELATA qual recebeu, em vez de assumir uma e estourar;
 *   · não toca no banco;
 *   · carrega o driver por importação dinâmica dentro de try/catch;
 *   · não lê valor de variável nenhuma, só se existe (true/false).
 *
 * Nenhum segredo sai daqui. Ainda assim, apagar assim que o diagnóstico
 * estiver feito: endpoint de depuração em produção é dívida.
 * ══════════════════════════════════════════════════════════════════════════
 */

export default async function handler(a, b) {
  const ehNode = !!(b && typeof b.end === 'function');

  const dados = {
    assinatura: ehNode ? 'Node clássico (req, res)' : 'Web (Request → Response)',
    requestTemHeadersGet: typeof a?.headers?.get === 'function',
    node: process.version,
    variaveis: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      DATABASE_URL_UNPOOLED: !!process.env.DATABASE_URL_UNPOOLED,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      PAINEL_TOKEN: !!process.env.PAINEL_TOKEN,
      SAL_VISITANTE: !!process.env.SAL_VISITANTE,
    },
  };

  try {
    const m = await import('@neondatabase/serverless');
    dados.driver = typeof m.neon === 'function' ? 'carregou' : 'carregou sem neon()';
  } catch (e) {
    dados.driver = `FALHOU: ${e?.message}`;
  }

  const corpo = JSON.stringify(dados, null, 2);

  if (ehNode) {
    b.statusCode = 200;
    b.setHeader('Content-Type', 'application/json; charset=utf-8');
    return b.end(corpo);
  }
  return new Response(corpo, {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
