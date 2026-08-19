/**
 * PONTE ENTRE O HANDLER WEB E O RUNTIME NODE DA VERCEL
 * ══════════════════════════════════════════════════════════════════════════
 * Os dois endpoints são escritos no padrão web — recebem `Request`, devolvem
 * `Response`. É a forma certa: é o que a plataforma documenta, é portável
 * para qualquer runtime, e é o que o resto de `_lib/db.js` assume ao chamar
 * `headers.get(...)`.
 *
 * Só que este projeto não usa framework, e nesse modo a Vercel invoca as
 * funções com a assinatura CLÁSSICA do Node, `(req, res)`. O `req.headers`
 * ali é um objeto simples, sem `.get()` — e a primeira linha de cada handler,
 * fora de qualquer try, fazia exatamente `request.headers.get('origin')`.
 * TypeError em toda invocação, 100% de erro, e um FUNCTION_INVOCATION_FAILED
 * que não conta nada. Confirmado por sonda, não por palpite.
 *
 * A escolha aqui é adaptar, não reescrever. Reescrever os dois handlers no
 * estilo Node espalharia a diferença por `corsPara`, `geoDe`, `ipDe` e `json`
 * também. Uma ponte de trinta linhas mantém tudo isso intacto e deixa os
 * endpoints portáveis no dia em que o runtime mudar.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** Node entrega os cabeçalhos como objeto; alguns valores vêm em array. */
function cabecalhos(brutos = {}) {
  const h = new Headers();
  for (const [chave, valor] of Object.entries(brutos)) {
    if (valor == null) continue;
    for (const v of Array.isArray(valor) ? valor : [valor]) h.append(chave, String(v));
  }
  return h;
}

/**
 * O corpo pode chegar de três formas: já lido pela Vercel em `req.body`
 * (string, Buffer ou objeto, conforme o content-type), ou ainda como fluxo.
 * Ler o fluxo quando `req.body` já existe devolveria vazio.
 */
async function corpoDe(req) {
  if (req.body != null) {
    if (typeof req.body === 'string') return req.body;
    if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
    return JSON.stringify(req.body);
  }
  // Nem todo `req` é iterável — e um throw aqui viraria o mesmo erro mudo
  // que passamos três deploys caçando. Sem fluxo, sem corpo.
  if (typeof req[Symbol.asyncIterator] !== 'function') return undefined;
  const partes = [];
  for await (const p of req) partes.push(typeof p === 'string' ? Buffer.from(p) : p);
  return partes.length ? Buffer.concat(partes).toString('utf8') : undefined;
}

/** Envolve um handler web para que ele funcione nas duas assinaturas. */
export function adaptar(handler) {
  return async function (req, res) {
    // Runtime web: `req` já é um Request e não há `res`. Passa direto.
    if (!res || typeof res.end !== 'function') return handler(req);

    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      // OPTIONS entra aqui porque o preflight não tem corpo e não pode
      // depender de ler fluxo nenhum para responder.
      const semCorpo = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);

      const requisicao = new Request(new URL(req.url, `${proto}://${host}`), {
        method: req.method,
        headers: cabecalhos(req.headers),
        body: semCorpo ? undefined : await corpoDe(req),
      });

      const resposta = await handler(requisicao);

      res.statusCode = resposta.status;
      resposta.headers.forEach((valor, chave) => res.setHeader(chave, valor));
      const texto = await resposta.text();
      res.end(texto.length ? texto : undefined);
    } catch (e) {
      // Sem isto voltaríamos ao erro mudo que nos custou três deploys.
      console.error('[adaptador]', e?.stack || e?.message);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ erro: 'Falha no adaptador', detalhe: e?.message }));
    }
  };
}
