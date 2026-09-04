/**
 * GET /api/painel — agregações para o painel de visitas
 * ══════════════════════════════════════════════════════════════════════════
 * Protegido por token no cabeçalho Authorization (env PAINEL_TOKEN).
 *
 * A série mensal é DESLIZANTE: sempre os últimos 12 meses a contar de hoje,
 * com os meses vazios preenchidos com zero. Sem isso o gráfico mentiria por
 * omissão — um mês sem visita simplesmente sumiria do eixo, e a linha
 * pareceria contínua quando na verdade teve um buraco.
 *
 * TUDO AQUI LÊ `visitas_gente`, NUNCA `visitas`. A tabela crua conta robô
 * como pessoa, e a diferença não é de margem: numa amostra de 41 visitas,
 * 31 vinham de datacenter. Um painel que soma as duas coisas não é um painel
 * otimista, é um painel errado — leva a concluir "o site não converte" quando
 * o que houve foi "quase ninguém entrou". O descartado sai em `ruido`, para
 * que o número menor venha acompanhado do motivo.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { sql, garantirEsquema, corsPara, json } from './_lib/db.js';
import { adaptar } from './_lib/adaptador.js';

async function handler(request) {
  const cors = corsPara(request.headers.get('origin'));

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const token = process.env.PAINEL_TOKEN;
  if (!token) return json({ erro: 'PAINEL_TOKEN não configurado no ambiente' }, 500, cors);

  const enviado = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (enviado !== token) return json({ erro: 'Não autorizado' }, 401, cors);

  try {
    await garantirEsquema();

    const [
      totais, ruido, funil, mensal, origens, lugares, aparelhos, secoes, cliques,
      marcados, recentes,
    ] = await Promise.all([
      sql`
        select
          count(*) filter (where evento = 'pageview')                as visitas,
          count(distinct visitante)                                  as unicos,
          count(distinct sessao)                                     as sessoes,
          count(*) filter (where evento = 'pageview'
                             and criado_em > now() - interval '30 days') as visitas_30d,
          /* Mediana, não média: com poucas dezenas de visitas uma única aba
             esquecida arrasta a média para onde ela quiser. O teto de 30min
             repete aqui o de coletar.js porque o que já está gravado veio
             com o teto antigo, de quatro horas. */
          round(percentile_cont(0.5) within group (
            order by least(duracao_ms, 30 * 60 * 1000)
          ) filter (where evento = 'saida' and duracao_ms between 1500 and 30 * 60 * 1000))
                                                                     as duracao_media_ms
        from visitas_gente`,

      /* O que foi descartado. Sem esta linha o painel apenas mostraria
         números menores, sem dizer por quê — e um número que encolhe sem
         explicação parece defeito, não correção. */
      sql`
        select
          count(*) filter (where evento = 'pageview')                as visitas,
          count(distinct visitante)                                  as unicos
        from visitas v
        where evento = 'pageview'
          and not exists (select 1 from visitas_gente g where g.id = v.id)`,

      /* O funil, contado por SESSÃO e não por evento. Três perguntas em ordem,
         e a ordem importa: quem chegou, quem leu até o fim, quem agiu. Uma
         taxa só significa alguma coisa contra o degrau imediatamente acima —
         "10% clicaram" não diz nada sem saber quantos chegaram a ver o botão.

         Janela de 90 dias: menos que isso e não há amostra; mais que isso e a
         conta passa a misturar versões diferentes da página. */
      sql`
        with sessoes as (
          select
            sessao,
            bool_or(evento = 'pageview')                     as entrou,
            bool_or(evento = 'secao'  and detalhe = 'contato') as leu_ate_o_fim,
            bool_or(evento = 'clique' and detalhe in
                     ('whatsapp', 'email', 'linkedin-contato')) as chamou,
            bool_or(evento = 'clique' and detalhe in ('cv-pt', 'cv-en')) as levou_cv
          from visitas_gente
          where criado_em > now() - interval '90 days'
          group by sessao
        )
        select
          count(*) filter (where entrou)                      as sessoes,
          count(*) filter (where leu_ate_o_fim)               as leram,
          count(*) filter (where chamou or levou_cv)          as agiram,
          count(*) filter (where chamou)                      as chamaram,
          count(*) filter (where levou_cv)                    as levaram_cv
        from sessoes`,

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
        left join visitas_gente v on date_trunc('month', v.criado_em) = m.mes
        group by m.mes
        order by m.mes`,

      sql`
        select coalesce(referrer_host, 'direto') as origem, count(*) as total
        from visitas_gente where evento = 'pageview'
        group by 1 order by total desc limit 12`,

      sql`
        select coalesce(pais, '??') as pais, coalesce(cidade, '—') as cidade, count(*) as total
        from visitas_gente where evento = 'pageview'
        group by 1, 2 order by total desc limit 15`,

      sql`
        select dispositivo, count(*) as total
        from visitas_gente where evento = 'pageview'
        group by 1 order by total desc`,

      sql`
        select detalhe as secao, count(distinct sessao) as sessoes
        from visitas_gente where evento = 'secao' and detalhe is not null
        group by 1 order by sessoes desc`,

      sql`
        select detalhe as alvo, count(*) as total
        from visitas_gente where evento = 'clique' and detalhe is not null
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
        from visitas_gente
        where ref is not null
        group by ref order by ultima desc limit 50`,

      sql`
        select criado_em, coalesce(referrer_host, 'direto') as origem,
               pais, cidade, dispositivo, ref, idioma
        from visitas_gente where evento = 'pageview'
        order by criado_em desc limit 50`,
    ]);

    return json({
      gerado_em: new Date().toISOString(),
      totais: totais[0],
      ruido: ruido[0],
      funil: funil[0],
      mensal, origens, lugares, aparelhos, secoes, cliques, marcados, recentes,
    }, 200, { ...cors, 'Cache-Control': 'no-store' });

  } catch (e) {
    console.error('[painel]', e?.message);
    return json({ erro: 'Falha ao consultar', detalhe: e?.message }, 500, cors);
  }
}

/* A Vercel invoca com (req, res) neste projeto; o handler acima é web. */
export default adaptar(handler);
