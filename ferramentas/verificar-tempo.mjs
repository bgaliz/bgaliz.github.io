/**
 * VERIFICAÇÃO DA CAMADA TEMPORAL
 * Rode com: node ferramentas/verificar-tempo.mjs
 *
 * Trava três coisas que quebram em silêncio se alguém mexer em tempo.js:
 *   1. as durações têm de bater EXATAMENTE com o LinkedIn (contagem inclusiva);
 *   2. o total não pode contar o freela concorrente em dobro (união, não soma);
 *   3. nada pode ficar congelado quando o relógio avança (viagem no tempo).
 */

import {
  mesesEntre, duracao, formatarDuracao, formatarMesAno, periodoLegivel,
  uniaoDeMeses, lacunas, anosDesde, ordenarPorRecencia, faixaDaLinha,
} from '../assets/js/tempo.js';
import { EXPERIENCIAS, PERFIL } from '../assets/dados/perfil.js';

let falhas = 0, testes = 0;

function conferir(rotulo, obtido, esperado) {
  testes++;
  const ok = String(obtido) === String(esperado);
  if (!ok) falhas++;
  const marca = ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${marca} ${rotulo.padEnd(46)} ${String(obtido).padEnd(22)}${ok ? '' : `esperado: ${esperado}`}`);
}

/* ── 1. Durações vs LinkedIn ───────────────────────────────────────────── */
console.log('\n\x1b[1m1. Durações dos cargos encerrados vs LinkedIn\x1b[0m');

const ESPERADO_LINKEDIN = {
  unisys:  { meses: 12, pt: '1 ano' },
  reduza:  { meses: 19, pt: '1 ano e 7 meses' },
  sgi:     { meses: 23, pt: '1 ano e 11 meses' },
  calango: { meses: 12, pt: '1 ano' },
  conexa:  { meses: 22, pt: '1 ano e 10 meses' },
  easy:    { meses: 2,  pt: '2 meses' },
};

for (const [id, esperado] of Object.entries(ESPERADO_LINKEDIN)) {
  const exp = EXPERIENCIAS.find((e) => e.id === id);
  conferir(`${exp.empresa.slice(0, 28)} — meses`, mesesEntre(exp.inicio, exp.fim), esperado.meses);
  conferir(`${exp.empresa.slice(0, 28)} — texto`, formatarDuracao(duracao(exp.inicio, exp.fim), 'pt'), esperado.pt);
}

/* ── 2. União de intervalos ────────────────────────────────────────────── */
console.log('\n\x1b[1m2. Total de experiência — união, não soma\x1b[0m');

const REF = new Date('2026-08-11T12:00:00Z');
const comoDev = EXPERIENCIAS.filter((e) => e.contaComoDev);

const soma = comoDev.reduce((s, e) => s + mesesEntre(e.inicio, e.fim, REF), 0);
const uniao = uniaoDeMeses(comoDev, REF);

// Valores em contagem INCLUSIVA (a mesma do LinkedIn), referência 08/2026.
conferir('soma ingênua (contaria em dobro)', soma, 91);
conferir('união de meses ativos', uniao.totalMeses, 81);
conferir('união formatada', formatarDuracao(uniao, 'pt'), '6 anos e 9 meses');
console.log(`  \x1b[2m→ a soma infla ${soma - uniao.totalMeses} meses; a Calango Doido roda em paralelo com SGI e Conexa\x1b[0m`);
conferir('anos de carreira (desde 2019-01)', anosDesde(PERFIL.inicioCarreira, REF), 7);

const buracos = lacunas(comoDev, REF);
console.log(`  \x1b[2m→ lacunas detectadas: ${buracos.map((b) => `${b.meses} meses`).join(', ') || 'nenhuma'}\x1b[0m`);

/* ── 3. Cargo em curso ─────────────────────────────────────────────────── */
console.log('\n\x1b[1m3. Cargo em curso (fim: null)\x1b[0m');

const az = EXPERIENCIAS.find((e) => e.id === 'az');
conferir('AZ — período pt', periodoLegivel(az.inicio, az.fim, 'pt'), 'ago 2025 — atual');
conferir('AZ — período en', periodoLegivel(az.inicio, az.fim, 'en'), 'Aug 2025 — present');
conferir('AZ — duração em 08/2026', formatarDuracao(duracao(az.inicio, az.fim, REF), 'pt'), '1 ano e 1 mês');

/* ── 4. Pluralização nos dois idiomas ──────────────────────────────────── */
console.log('\n\x1b[1m4. Pluralização (Intl.PluralRules, não n > 1)\x1b[0m');

conferir('1 mês  · pt', formatarDuracao({ anos: 0, meses: 1 }, 'pt'), '1 mês');
conferir('2 meses · pt', formatarDuracao({ anos: 0, meses: 2 }, 'pt'), '2 meses');
conferir('1 ano  · pt', formatarDuracao({ anos: 1, meses: 0 }, 'pt'), '1 ano');
conferir('1 month · en', formatarDuracao({ anos: 0, meses: 1 }, 'en'), '1 month');
conferir('2 years 3 months · en', formatarDuracao({ anos: 2, meses: 3 }, 'en'), '2 years 3 months');
conferir('mês/ano · pt', formatarMesAno('2025-08', 'pt'), 'ago 2025');
conferir('mês/ano · en', formatarMesAno('2025-08', 'en'), 'Aug 2025');

/* ── 5. Viagem no tempo ────────────────────────────────────────────────── */
console.log('\n\x1b[1m5. Viagem no tempo — nada pode ficar congelado\x1b[0m');

const FUTURO = new Date('2027-06-15T12:00:00Z');
conferir('anos de carreira em 06/2027', anosDesde(PERFIL.inicioCarreira, FUTURO), 8);
conferir('AZ em 06/2027', formatarDuracao(duracao(az.inicio, az.fim, FUTURO), 'pt'), '1 ano e 11 meses');
conferir('anos desde a formatura em 06/2027', anosDesde('2018-12', FUTURO), 8);
conferir('ano final da linha em 2027', faixaDaLinha(EXPERIENCIAS, FUTURO).anoFinal, 2027);

/* ── 6. Ordenação automática ───────────────────────────────────────────── */
console.log('\n\x1b[1m6. Ordenação — em curso primeiro, depois do mais recente\x1b[0m');

const ordem = ordenarPorRecencia(EXPERIENCIAS).map((e) => e.id).join(' → ');
conferir('ordem cronológica', ordem, 'az → easy → conexa → calango → sgi → reduza → unisys');
console.log('  \x1b[2m→ nota: Conexa (set/2022) vem antes de Calango (fev/2022) por início mais recente\x1b[0m');

const faixa = faixaDaLinha(EXPERIENCIAS, REF);
conferir('faixa da linha do tempo', `${faixa.anoInicial}–${faixa.anoFinal}`, '2018–2026');

/* ── Resultado ─────────────────────────────────────────────────────────── */
const cor = falhas === 0 ? '\x1b[32m' : '\x1b[31m';
console.log(`\n${cor}${'─'.repeat(72)}\x1b[0m`);
console.log(`${cor}  ${testes - falhas}/${testes} passaram${falhas ? ` · ${falhas} FALHARAM` : ''}\x1b[0m\n`);
process.exit(falhas === 0 ? 0 : 1);
