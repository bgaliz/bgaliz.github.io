/**
 * GET /api/painel — agregações para o painel de visitas
 * ══════════════════════════════════════════════════════════════════════════
 * Protegido por token no cabeçalho Authorization (env PAINEL_TOKEN).
 *
 * A série mensal é DESLIZANTE: sempre os últimos 12 meses a contar de hoje,
 * com os meses vazios preenchidos com zero. Sem isso o gráfico mentiria por
 * omissão — um mês sem visita simplesmente sumiria do eixo, e a linha
 * pareceria contínua quando na verdade teve um buraco.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { sql, garantirEsquema, corsPara, json } from './_lib/db.js';

export default async function handler(request) {
  const cors = corsPara(request.headers.get('origin'));

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const token = process.env.PAINEL_TOKEN;
  if (!token) return json({ erro: 'PAINEL_TOKEN não configurado no ambiente' }, 500, cors);

  const enviado = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (enviado !== token) return json({ erro: 'Não autorizado' }, 401, cors);

  try {
    await garantirEsquema();

    const [
      totais, mensal, origens, lugares, aparelhos, secoes, cliques, marcados, recentes,
    ] = await Promise.all([
      sql`
        select
          count(*) filter (where evento = 'pageview')                as visitas,
          count(distinct visitante)                                  as unicos,
          count(distinct sessao)                                     as sessoes,
          count(*) filter (where evento = 'pageview'
                             and criado_em > now() - interval '30 days') as visitas_30d,
          round(avg(duracao_ms) filter (where evento = 'saida' and duracao_ms > 1500))
                                                                     as duracao_media_ms
        from visitas`,

      // Série de 12 meses com os vazios preenchidos.
      sql`
        with meses as (
          select generate_series(
            date_trunc('month', now()) - interval '11 months',
            date_trunc('month', now()),
            interval '1 month'
          ) as mes
        )
        select
          to_char(m.mes, 'YYYY-MM')                                   as mes,
          coalesce(count(v.id) filter (where v.evento = 'pageview'), 0) as visitas,
          coalesce(count(distinct v.visitante), 0)                    as unicos
        from meses m
        left join visitas v on date_trunc('month', v.criado_em) = m.mes
        group by m.mes
        order by m.mes`,

      sql`
        select coalesce(referrer_host, 'direto') as origem, count(*) as total
        from visitas where evento = 'pageview'
        group by 1 order by total desc limit 12`,

      sql`
        select coalesce(pais, '??') as pais, coalesce(cidade, '—') as cidade, count(*) as total
        from visitas where evento = 'pageview'
        group by 1, 2 order by total desc limit 15`,

      sql`
        select dispositivo, count(*) as total
        from visitas where evento = 'pageview'
        group by 1 order by total desc`,

      sql`
        select detalhe as secao, count(distinct sessao) as sessoes
        from visitas where evento = 'secao' and detalhe is not null
        group by 1 order by sessoes desc`,

      sql`
        select detalhe as alvo, count(*) as total
        from visitas where evento = 'clique' and detalhe is not null
        group by 1 order by total desc limit 20`,

      // Links marcados: é o que responde "o que eu enviei foi aberto?".
      sql`
        select
          ref,
          count(*) filter (where evento = 'pageview')  as aberturas,
          count(distinct visitante)                    as pessoas,
          min(criado_em)                               as primeira,
          max(criado_em)                               as ultima,
          count(*) filter (where evento = 'clique')    as cliques
        from visitas
        where ref is not null
        group by ref order by ultima desc limit 50`,

      sql`
        select criado_em, coalesce(referrer_host, 'direto') as origem,
               pais, cidade, dispositivo, ref, idioma
        from visitas where evento = 'pageview'
        order by criado_em desc limit 50`,
    ]);

    return json({
      gerado_em: new Date().toISOString(),
      totais: totais[0],
      mensal, origens, lugares, aparelhos, secoes, cliques, marcados, recentes,
    }, 200, { ...cors, 'Cache-Control': 'no-store' });

  } catch (e) {
    console.error('[painel]', e?.message);
    return json({ erro: 'Falha ao consultar', detalhe: e?.message }, 500, cors);
  }
}
