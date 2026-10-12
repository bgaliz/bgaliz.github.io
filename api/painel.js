/**
 * GET /api/painel — agregações para o painel de visitas
 * ══════════════════════════════════════════════════════════════════════════
 * Autorização: cookie de sessão (login em /api/entrar) ou, para curl e
 * scripts, `Authorization: Bearer <PAINEL_TOKEN>`. Só mesma origem: o painel
 * mora no mesmo domínio da API, então não há CORS para ninguém.
 *
 * A série mensal é DESLIZANTE: sempre os últimos 12 meses a contar de hoje,
 * com os meses vazios preenchidos com zero. Sem isso o gráfico mentiria por
 * omissão — um mês sem visita simplesmente sumiria do eixo.
 *
 * TUDO AQUI LÊ `visitas_gente`, NUNCA `visitas`, exceto o bloco de scanners.
 * A tabela crua conta robô como pessoa: em 12/out/2026, das 48 visitas que
 * passavam pelo filtro de user-agent, 26 eram datacenter e 14 eram o próprio
 * dono. O descartado sai em `ruido` e em `scanners`, para que o número menor
 * venha acompanhado do motivo.
 *
 * PESSOA CONFIRMADA = sessão com interação real (ponteiro, toque, roda ou
 * tecla). Scanner headless abre, executa o JS e sai sem tocar em nada. As
 * sessões gravadas antes da medição nova (versao nula) não têm esse sinal e
 * contam como antes; elas saem da janela de 90 dias sozinhas.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { sql, garantirEsquema, json } from './_lib/db.js';
import { autorizado } from './_lib/sessao.js';
import { adaptar } from './_lib/adaptador.js';

const SEM_CACHE = { 'Cache-Control': 'no-store' };

async function handler(request) {
  if (request.method !== 'GET') return json({ erro: 'Método não permitido' }, 405, SEM_CACHE);
  if (!process.env.PAINEL_TOKEN) return json({ erro: 'PAINEL_TOKEN não configurado no ambiente' }, 500, SEM_CACHE);
  if (!autorizado(request)) return json({ erro: 'Não autorizado' }, 401, SEM_CACHE);

  try {
    await garantirEsquema();

    const [
      totais, ruido, funil, mensal, origens, lugares, aparelhos, secoes, cliques,
      marcados, recentes, scanners, profundidade, paginas, versoes, interesse,
    ] = await Promise.all([
      sql`
        with confirmadas as (
          select distinct sessao from visitas_gente where evento = 'interacao'
        )
        select
          count(*) filter (where evento = 'pageview')                as visitas,
          count(distinct visitante)                                  as unicos,
          count(distinct sessao)                                     as sessoes,
          (select count(*) from confirmadas)                         as pessoas,
          count(*) filter (where evento = 'pageview'
                             and criado_em > now() - interval '30 days') as visitas_30d,
          /* Mediana, não média: com poucas dezenas de visitas uma única aba
             esquecida arrasta a média para onde ela quiser. */
          round(percentile_cont(0.5) within group (
            order by least(duracao_ms, 30 * 60 * 1000)
          ) filter (where evento = 'saida' and duracao_ms between 1500 and 30 * 60 * 1000))
                                                                     as duracao_media_ms,
          /* Tempo ATIVO: aba visível e alguém interagindo. É o número que
             responde "leram ou só deixaram aberto?". */
          round(percentile_cont(0.5) within group (order by ativo_ms)
                filter (where evento = 'saida' and ativo_ms > 0))    as ativo_mediano_ms
        from visitas_gente`,

      sql`
        select
          count(*) filter (where evento = 'pageview')                as visitas,
          count(distinct visitante)                                  as unicos
        from visitas v
        where evento = 'pageview'
          and not exists (select 1 from visitas_gente g where g.id = v.id)`,

      /* O funil, por SESSÃO, em 90 dias. Cada taxa só significa alguma coisa
         contra o degrau imediatamente acima. "Leu" = chegou ao contato ou
         passou de 75% da página. */
      sql`
        with sessoes as (
          select
            sessao,
            bool_or(evento = 'pageview')                                as entrou,
            bool_or(evento = 'interacao') or bool_and(versao is null)   as confirmada,
            bool_or((evento = 'secao' and detalhe = 'contato')
                 or (evento = 'profundidade' and detalhe in ('75', '100'))) as leu_ate_o_fim,
            bool_or(evento in ('abrir', 'relatorio'))                   as aprofundou,
            bool_or(evento = 'clique' and detalhe in
                     ('whatsapp', 'email', 'linkedin-contato'))
              or bool_or(evento = 'copiar' and detalhe = 'email')       as chamou,
            bool_or(evento = 'clique' and detalhe in ('cv-pt', 'cv-en'))   as levou_cv
          from visitas_gente
          where criado_em > now() - interval '90 days'
          group by sessao
        )
        select
          count(*) filter (where entrou)                                  as sessoes,
          count(*) filter (where entrou and confirmada)                   as confirmadas,
          count(*) filter (where confirmada and leu_ate_o_fim)            as leram,
          count(*) filter (where confirmada and aprofundou)               as aprofundaram,
          count(*) filter (where confirmada and (chamou or levou_cv))     as agiram,
          count(*) filter (where confirmada and chamou)                   as chamaram,
          count(*) filter (where confirmada and levou_cv)                 as levaram_cv
        from sessoes`,

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
        select coalesce(pais, '??') as pais, coalesce(cidade, '-') as cidade, count(*) as total
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
        from visitas_gente where evento in ('clique', 'copiar') and detalhe is not null
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
               pais, cidade, dispositivo, ref, idioma, pagina
        from visitas_gente where evento = 'pageview'
        order by criado_em desc limit 50`,

      /* Scanners de ATS e de e-mail: o que o filtro descartou, mas só o que
         chegou por link marcado. Não é visita de gente, e é informação útil:
         quer dizer que o currículo enviado foi processado e o link, aberto
         por máquina. */
      sql`
        select ref, count(*) as aberturas, max(criado_em) as ultima,
               string_agg(distinct coalesce(cidade, pais, '?'), ', ') as de_onde
        from visitas v
        where evento = 'pageview' and ref is not null
          and not exists (select 1 from visitas_gente g where g.id = v.id)
        group by ref order by ultima desc limit 30`,

      sql`
        select detalhe as marca, count(distinct sessao) as sessoes
        from visitas_gente where evento = 'profundidade'
        group by 1 order by (detalhe)::int`,

      sql`
        select coalesce(pagina, '/') as pagina, count(*) as visitas,
               round(percentile_cont(0.5) within group (order by ativo_ms)
                     filter (where ativo_ms > 0)) as ativo_mediano_ms
        from visitas_gente where evento in ('pageview', 'saida')
        group by 1 order by visitas desc`,

      /* Antes e depois. Sessões confirmadas e tempo ativo por versão do site:
         é como se responde "a renovação funcionou?" sem misturar épocas. */
      sql`
        select coalesce(versao, 'antes') as versao,
               count(distinct sessao) filter (where evento = 'pageview') as sessoes,
               count(distinct sessao) filter (where evento = 'interacao') as confirmadas,
               round(percentile_cont(0.5) within group (order by ativo_ms)
                     filter (where evento = 'saida' and ativo_ms > 0)) as ativo_mediano_ms
        from visitas_gente
        group by 1 order by min(criado_em)`,

      sql`
        select evento, detalhe, count(*) as total
        from visitas_gente
        where evento in ('abrir', 'relatorio') and detalhe is not null
        group by 1, 2 order by total desc limit 20`,
    ]);

    return json({
      gerado_em: new Date().toISOString(),
      totais: totais[0],
      ruido: ruido[0],
      funil: funil[0],
      mensal, origens, lugares, aparelhos, secoes, cliques, marcados, recentes,
      scanners, profundidade, paginas, versoes, interesse,
    }, 200, SEM_CACHE);

  } catch (e) {
    // Só chega aqui quem já se autenticou: o motivo ajuda a consertar.
    console.error('[painel]', e?.message);
    return json({ erro: 'Falha ao consultar', detalhe: e?.message }, 500, SEM_CACHE);
  }
}

/* A Vercel invoca com (req, res) neste projeto; o handler acima é web. */
export default adaptar(handler);
