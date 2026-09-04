/**
 * PAINEL DE VISITAS
 * ══════════════════════════════════════════════════════════════════════════
 * Gráficos desenhados em SVG, sem biblioteca. O site inteiro não carrega
 * uma dependência sequer: abrir exceção de 90 KB de Chart.js para desenhar
 * doze barras contradiria todo o resto.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { urlDe, SITE } from './config.js';
import { haQuantoTempo } from './tempo.js';
import { diagnosticar } from './diagnostico.js';

const $ = (s) => document.querySelector(s);
const CHAVE = 'painelToken';

const entrada = $('#entrada');
const corpo = $('#corpo');

/* ── Autenticação ──────────────────────────────────────────────────────── */

const token = () => { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } };

async function buscar(t) {
  const url = urlDe('painel');
  if (!url) throw new Error('API_BASE ainda não configurada em assets/js/config.js');

  const r = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
  if (r.status === 401) throw new Error('Token incorreto.');
  if (!r.ok) throw new Error(`Falha ${r.status}: ${(await r.json().catch(() => ({}))).erro || ''}`);
  return r.json();
}

function mostrarEntrada(msg) {
  entrada.hidden = false;
  corpo.hidden = true;
  const erro = $('#erro-token');
  erro.hidden = !msg;
  erro.textContent = msg || '';
}

/* ── Formatação ────────────────────────────────────────────────────────── */

const nf = new Intl.NumberFormat('pt-BR');
const df = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function duracaoCurta(ms) {
  if (!ms) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}

const escapar = (t) => String(t ?? '').replace(/[<>&"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

/* ── Gráfico mensal, SVG à mão ─────────────────────────────────────────── */

function grafico(dados) {
  const L = 1000, A = 260, m = { t: 20, d: 46, e: 44, b: 8 };
  const larg = L - m.e - m.b, alt = A - m.t - m.d;
  const max = Math.max(1, ...dados.map((d) => +d.visitas));
  const passo = larg / dados.length;
  const bl = Math.min(passo * 0.52, 46);

  // Linhas-guia em valores redondos, não em frações arbitrárias.
  const alvo = Math.max(1, Math.ceil(max / 4));
  const grade = [];
  for (let v = 0; v <= max; v += alvo) grade.push(v);

  const y = (v) => m.t + alt - (v / max) * alt;

  const guias = grade.map((v) => `
    <line x1="${m.e}" y1="${y(v)}" x2="${L - m.b}" y2="${y(v)}"
          stroke="var(--fio)" stroke-width="1" ${v === 0 ? '' : 'stroke-dasharray="2 4"'}/>
    <text x="${m.e - 10}" y="${y(v) + 4}" text-anchor="end"
          fill="var(--texto-tenue)" font-size="12" font-family="var(--f-mono)">${v}</text>`).join('');

  const barras = dados.map((d, i) => {
    const x = m.e + i * passo + (passo - bl) / 2;
    const h = Math.max(+d.visitas > 0 ? 2 : 0, (+d.visitas / max) * alt);
    const [ano, mes] = d.mes.split('-');
    const rotulo = MESES[+mes - 1];
    const ultimo = i === dados.length - 1;
    return `
      <g class="barra">
        <rect x="${x}" y="${y(+d.visitas)}" width="${bl}" height="${h}"
              fill="${ultimo ? 'var(--ambar)' : 'var(--petroleo)'}"/>
        <rect x="${m.e + i * passo}" y="${m.t}" width="${passo}" height="${alt}" fill="transparent">
          <title>${rotulo}/${ano}: ${d.visitas} visita(s), ${d.unicos} único(s)</title>
        </rect>
        <text x="${x + bl / 2}" y="${A - m.d + 22}" text-anchor="middle"
              fill="var(--texto-tenue)" font-size="12" font-family="var(--f-mono)">${rotulo}</text>
        ${(+mes === 1 || i === 0) ? `<text x="${x + bl / 2}" y="${A - m.d + 40}" text-anchor="middle"
              fill="var(--fio-forte)" font-size="11" font-family="var(--f-mono)">${ano}</text>` : ''}
        ${+d.visitas > 0 ? `<text x="${x + bl / 2}" y="${y(+d.visitas) - 8}" text-anchor="middle"
              fill="var(--texto-suave)" font-size="12" font-family="var(--f-mono)">${d.visitas}</text>` : ''}
      </g>`;
  }).join('');

  return `<svg viewBox="0 0 ${L} ${A}" role="img"
               aria-label="Visitas por mês nos últimos 12 meses">${guias}${barras}</svg>`;
}

/* ── Barras horizontais para listas ────────────────────────────────────── */

function barras(itens, chave, valor, formatar = nf.format) {
  if (!itens.length) return '<p class="vazio mono">nada ainda</p>';
  const max = Math.max(...itens.map((i) => +i[valor]));
  return itens.map((i) => `
    <div class="barra-h">
      <span class="barra-h__nome mono">${escapar(i[chave])}</span>
      <span class="barra-h__trilho">
        <span class="barra-h__preenche" style="--p:${(+i[valor] / max) * 100}%"></span>
      </span>
      <span class="barra-h__valor mono num">${formatar(+i[valor])}</span>
    </div>`).join('');
}

/* ── Diagnóstico ───────────────────────────────────────────────────────── */

/* O nível vira classe, e a cor mora no CSS. Nenhuma cor é decidida aqui: o
   mesmo âmbar que significa "atenção" no laudo precisa significar a mesma
   coisa no resto do painel, e isso só se garante num arquivo só. */
function pintarLaudo(d) {
  const laudo = diagnosticar(d);
  const secao = $('#laudo');

  secao.dataset.nivel = laudo.nivel;
  $('#laudo-veredito').textContent = laudo.veredito;
  $('#laudo-detalhe').textContent = laudo.detalhe;
  $('#laudo-acao').textContent = laudo.acao;

  $('#laudo-degraus').innerHTML = laudo.degraus.map((g) => `
    <li class="degrau" data-nivel="${g.nivel}">
      <span class="degrau__valor num">${nf.format(g.valor)}</span>
      <span class="degrau__rotulo mono">${escapar(g.rotulo)}</span>
      ${g.taxa ? `<span class="degrau__taxa mono num">${g.taxa}</span>` : ''}
    </li>`).join('');

  $('#laudo-sinais').innerHTML = laudo.sinais.map((s) => `
    <li class="sinal" data-nivel="${s.nivel}">
      <span class="sinal__rotulo mono">${escapar(s.rotulo)}</span>
      <span class="sinal__texto">${escapar(s.texto)}</span>
    </li>`).join('');

  secao.hidden = false;
}

/* ── Pintura ───────────────────────────────────────────────────────────── */

function pintar(d) {
  entrada.hidden = true;
  corpo.hidden = false;

  const t = d.totais || {};
  $('#kpi-visitas').textContent = nf.format(+t.visitas || 0);
  $('#kpi-unicos').textContent = nf.format(+t.unicos || 0);
  $('#kpi-30d').textContent = nf.format(+t.visitas_30d || 0);
  $('#kpi-tempo').textContent = duracaoCurta(+t.duracao_media_ms);

  /* O ruído descartado. Aparece só quando existe — num painel limpo, uma
     linha dizendo "0 descartadas" seria ela própria ruído. */
  const r = d.ruido || {};
  const descartadas = +r.visitas || 0;
  const elo = $('#ruido');
  if (descartadas) {
    const total = descartadas + (+t.visitas || 0);
    const pct = Math.round((descartadas / total) * 100);
    elo.textContent = `${nf.format(descartadas)} de ${nf.format(total)} visitas (${pct}%) `
      + 'vieram de robô ou datacenter e ficaram de fora dos números acima.';
    elo.hidden = false;
  } else {
    elo.hidden = true;
  }

  pintarLaudo(d);

  $('#gerado').textContent = `atualizado ${haQuantoTempo(d.gerado_em, 'pt')}`;
  $('#grafico-mensal').innerHTML = grafico(d.mensal || []);

  $('#lista-origens').innerHTML = barras(d.origens || [], 'origem', 'total');
  $('#lista-secoes').innerHTML = barras(d.secoes || [], 'secao', 'sessoes');
  $('#lista-cliques').innerHTML = barras(d.cliques || [], 'alvo', 'total');
  $('#lista-aparelhos').innerHTML = barras(d.aparelhos || [], 'dispositivo', 'total');

  $('#tabela-marcados tbody').innerHTML = (d.marcados || []).length
    ? d.marcados.map((m) => `
        <tr>
          <td class="mono forte">${escapar(m.ref)}</td>
          <td class="num">${m.aberturas}</td>
          <td class="num">${m.pessoas}</td>
          <td class="num ${+m.cliques ? 'positivo' : ''}">${m.cliques}</td>
          <td class="mono tenue">${df.format(new Date(m.primeira))}</td>
          <td class="mono tenue">${haQuantoTempo(m.ultima, 'pt')}</td>
        </tr>`).join('')
    : '<tr><td colspan="6" class="vazio mono">nenhum link marcado foi aberto ainda</td></tr>';

  $('#tabela-lugares tbody').innerHTML = (d.lugares || []).map((l) => `
    <tr><td class="mono">${escapar(l.pais)}</td>
        <td>${escapar(l.cidade)}</td>
        <td class="num">${l.total}</td></tr>`).join('')
    || '<tr><td colspan="3" class="vazio mono">nada ainda</td></tr>';

  $('#tabela-recentes tbody').innerHTML = (d.recentes || []).map((r) => `
    <tr><td class="mono tenue">${haQuantoTempo(r.criado_em, 'pt')}</td>
        <td class="mono">${escapar(r.origem)}</td>
        <td class="tenue">${escapar([r.cidade, r.pais].filter(Boolean).join(', ') || '—')}</td>
        <td class="mono">${r.ref ? escapar(r.ref) : '<span class="tenue">—</span>'}</td></tr>`).join('')
    || '<tr><td colspan="4" class="vazio mono">nada ainda</td></tr>';
}

/* ── Gerador de links marcados ─────────────────────────────────────────── */

const etiquetar = (t) => t.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')   // tira acento
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

$('#gerador').addEventListener('submit', (e) => {
  e.preventDefault();
  const bruto = $('#campo-rotulo').value.trim();
  if (!bruto) return;
  const url = `${SITE}/?ref=${etiquetar(bruto)}`;
  $('#link-gerado').textContent = url;
  $('#saida-link').hidden = false;
  $('#copiar').textContent = 'copiar';
});

$('#copiar').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#link-gerado').textContent);
    $('#copiar').textContent = 'copiado ✓';
  } catch (e) {
    $('#copiar').textContent = 'copie à mão';
  }
});

/* ── Ciclo de vida ─────────────────────────────────────────────────────── */

async function carregar(t) {
  try {
    pintar(await buscar(t));
  } catch (e) {
    try { if (/token/i.test(e.message)) localStorage.removeItem(CHAVE); } catch (err) {}
    mostrarEntrada(e.message);
  }
}

$('#forma-token').addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = $('#campo-token').value.trim();
  if (!t) return;
  try { localStorage.setItem(CHAVE, t); } catch (err) {}
  await carregar(t);
});

$('#recarregar').addEventListener('click', () => { const t = token(); if (t) carregar(t); });

$('#sair').addEventListener('click', () => {
  try { localStorage.removeItem(CHAVE); } catch (e) {}
  location.reload();
});

const inicial = token();
if (inicial) carregar(inicial);
else mostrarEntrada();
