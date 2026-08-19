/**
 * GET /api/limpar — retenção automática
 * ══════════════════════════════════════════════════════════════════════════
 * A LGPD (arts. 15 e 16) manda eliminar o dado quando a finalidade se
 * encerra, e o GDPR tem o mesmo princípio na limitação de armazenamento. A
 * finalidade aqui é saber se um link enviado foi aberto — isso vence. Visita
 * de dois anos atrás não responde pergunta nenhuma e só aumenta o que há a
 * perder num vazamento.
 *
 * Dezoito meses porque uma candidatura pode voltar a ser assunto um ano
 * depois, e não mais que isso.
 *
 * QUEM PODE CHAMAR
 * A Vercel dispara um GET diário nesta rota (ver `crons` no vercel.json) e,
 * com CRON_SECRET definido no ambiente, envia o cabeçalho Authorization. O
 * PAINEL_TOKEN também vale, para você poder rodar a limpeza à mão e conferir
 * que ela funciona sem esperar o dia virar.
 *
 * A operação é idempotente: rodar duas vezes seguidas apaga o mesmo nada.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { sql, garantirEsquema, corsPara, json } from './_lib/db.js';
import { adaptar } from './_lib/adaptador.js';

/* Um número só. O prazo entra na consulta como parâmetro (`$1::interval`),
   não como literal repetido — dois lugares para o mesmo prazo é um lugar
   para eles discordarem. O texto em privacidade.html precisa dizer o mesmo:
   política que promete um prazo e código que apaga em outro é pior que
   não ter prazo nenhum. */
const RETENCAO = '18 months';

async function handler(request) {
  const cors = corsPara(request.headers.get('origin'));
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const cron = process.env.CRON_SECRET;
  const painel = process.env.PAINEL_TOKEN;
  if (!cron && !painel) {
    return json({ erro: 'Nem CRON_SECRET nem PAINEL_TOKEN configurados' }, 500, cors);
  }

  const enviado = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!enviado || (enviado !== cron && enviado !== painel)) {
    return json({ erro: 'Não autorizado' }, 401, cors);
  }

  try {
    await garantirEsquema();
    // `returning id` para saber quantas linhas caíram — sem isso o driver
    // devolve um array vazio e a rotina não teria como se auditar.
    const apagadas = await sql`
      delete from visitas
      where criado_em < now() - ${RETENCAO}::interval
      returning id`;

    console.log(`[limpar] ${apagadas.length} registro(s) além de ${RETENCAO}`);
    return json({ ok: true, retencao: RETENCAO, apagados: apagadas.length }, 200, cors);
  } catch (e) {
    console.error('[limpar]', e?.message);
    return json({ erro: 'Falha ao limpar', detalhe: e?.message }, 500, cors);
  }
}

export default adaptar(handler);
