/**
 * CAMADA DE CÁLCULO TEMPORAL
 * ══════════════════════════════════════════════════════════════════════════
 * Sem dependências. Roda igual no navegador e no Node (construir.mjs).
 *
 * ── CONVENÇÃO DE CONTAGEM: INCLUSIVA ─────────────────────────────────────
 * O LinkedIn conta as duas pontas do intervalo. Validado contra os 6 cargos
 * encerrados do currículo:
 *
 *   Unisys    fev/2018 – jan/2019   LinkedIn "1 ano"      → 12 meses ✓
 *   Reduza    jan/2019 – jul/2020   LinkedIn "1 a 7 m"    → 19 meses ✓
 *   SGI       ago/2020 – jun/2022   LinkedIn "1 a 11 m"   → 23 meses ✓
 *   Calango   fev/2022 – jan/2023   LinkedIn "1 ano"      → 12 meses ✓
 *   Conexa    set/2022 – jun/2024   LinkedIn "1 a 10 m"   → 22 meses ✓
 *   Easy      ago/2024 – set/2024   LinkedIn "2 meses"    →  2 meses ✓
 *
 * Contagem exclusiva daria 1 mês a menos em TODAS — inconsistência visível
 * para quem cruzar o portfólio com o LinkedIn. Não mude a fórmula sem rodar
 * `node ferramentas/verificar-tempo.mjs`.
 * ══════════════════════════════════════════════════════════════════════════
 */

/** 'AAAA-MM' → índice absoluto de mês. */
export function paraMeses(data) {
  const [ano, mes] = String(data).split('-').map(Number);
  return ano * 12 + mes;
}

/** Data de hoje como 'AAAA-MM'. Parametrizável para teste e viagem no tempo. */
export function hoje(referencia = new Date()) {
  const m = String(referencia.getMonth() + 1).padStart(2, '0');
  return `${referencia.getFullYear()}-${m}`;
}

/**
 * Meses entre duas âncoras, INCLUSIVO nas duas pontas.
 * `fim` nulo ⇒ até hoje (ou até a referência informada).
 */
export function mesesEntre(inicio, fim, referencia = new Date()) {
  const f = fim == null ? hoje(referencia) : fim;
  return Math.max(0, paraMeses(f) - paraMeses(inicio) + 1);
}

/** { anos, meses, totalMeses } */
export function duracao(inicio, fim, referencia = new Date()) {
  const totalMeses = mesesEntre(inicio, fim, referencia);
  return { anos: Math.floor(totalMeses / 12), meses: totalMeses % 12, totalMeses };
}

/* ── Formatação ─────────────────────────────────────────────────────────── */

const UNIDADES = {
  pt: {
    ano:  { one: 'ano',  other: 'anos'  },
    mes:  { one: 'mês',  other: 'meses' },
    juncao: ' e ',
    atual: 'atual',
    ha: (t) => `há ${t}`,
    menosDeUmMes: 'menos de um mês',
  },
  en: {
    ano:  { one: 'year',  other: 'years'  },
    mes:  { one: 'month', other: 'months' },
    juncao: ' ',
    atual: 'present',
    ha: (t) => `${t} ago`,
    menosDeUmMes: 'less than a month',
  },
};

const LOCALE = { pt: 'pt-BR', en: 'en-US' };
const _plural = {};

function plural(idioma, n, unidade) {
  const chave = LOCALE[idioma];
  _plural[chave] ??= new Intl.PluralRules(chave);
  const regra = _plural[chave].select(n) === 'one' ? 'one' : 'other';
  return UNIDADES[idioma][unidade][regra];
}

/**
 * { anos, meses } → "1 ano e 1 mês" / "1 year 1 month".
 * Resolve singular/plural pelas regras reais do idioma, não por `n > 1`.
 */
export function formatarDuracao({ anos, meses }, idioma = 'pt') {
  const u = UNIDADES[idioma];
  const partes = [];
  if (anos > 0)  partes.push(`${anos} ${plural(idioma, anos, 'ano')}`);
  if (meses > 0) partes.push(`${meses} ${plural(idioma, meses, 'mes')}`);
  if (partes.length === 0) return u.menosDeUmMes;
  return partes.join(u.juncao);
}

const _mesFmt = {};

/**
 * '2025-08' → "ago 2025" / "Aug 2025".
 * `timeZone: 'UTC'` é obrigatório: as âncoras são meses, não instantes. Sem
 * isso o Intl formata no fuso local e 2025-08 vira "jul 2025" em qualquer
 * fuso a oeste de Greenwich — ou seja, no Brasil inteiro.
 */
export function formatarMesAno(data, idioma = 'pt') {
  const chave = LOCALE[idioma];
  _mesFmt[chave] ??= new Intl.DateTimeFormat(chave, { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const [ano, mes] = String(data).split('-').map(Number);
  return _mesFmt[chave]
    .format(new Date(Date.UTC(ano, mes - 1, 1)))
    .replace(/\./g, '')          // pt-BR devolve "ago. de 2025"
    .replace(/\bde\b\s*/g, '')
    .trim();
}

/** "ago 2025 — atual" / "Aug 2025 — present". */
export function periodoLegivel(inicio, fim, idioma = 'pt') {
  const i = formatarMesAno(inicio, idioma);
  const f = fim == null ? UNIDADES[idioma].atual : formatarMesAno(fim, idioma);
  return `${i} — ${f}`;
}

/** Anos inteiros decorridos desde uma âncora. */
export function anosDesde(data, referencia = new Date()) {
  return Math.floor(mesesEntre(data, null, referencia) / 12);
}

/** "há 7 anos" / "7 years ago". */
export function tempoDecorrido(data, idioma = 'pt', referencia = new Date()) {
  const d = duracao(data, null, referencia);
  return UNIDADES[idioma].ha(formatarDuracao({ anos: d.anos, meses: 0 }, idioma));
}

/* ── União de intervalos ────────────────────────────────────────────────── */

/**
 * Total de meses ATIVOS, sem contar sobreposição em dobro.
 * Necessário porque o freelance na Calango Doido (fev/2022 – jan/2023) roda
 * em paralelo com SGI e Conexa: somar durações inflaria o total.
 */
export function uniaoDeMeses(intervalos, referencia = new Date()) {
  const faixas = intervalos
    .map(({ inicio, fim }) => [
      paraMeses(inicio),
      paraMeses(fim == null ? hoje(referencia) : fim),
    ])
    .sort((a, b) => a[0] - b[0]);

  const unidas = [];
  for (const [ini, fim] of faixas) {
    const ultima = unidas[unidas.length - 1];
    // `ini <= ultima[1] + 1` funde meses adjacentes (jul→ago é contínuo).
    if (ultima && ini <= ultima[1] + 1) ultima[1] = Math.max(ultima[1], fim);
    else unidas.push([ini, fim]);
  }

  const total = unidas.reduce((s, [i, f]) => s + (f - i + 1), 0);
  return { totalMeses: total, anos: Math.floor(total / 12), meses: total % 12, faixas: unidas };
}

/** Buracos na linha do tempo, em meses. Usado para auditoria, não para exibir. */
export function lacunas(intervalos, referencia = new Date()) {
  const { faixas } = uniaoDeMeses(intervalos, referencia);
  const buracos = [];
  for (let i = 1; i < faixas.length; i++) {
    const vazio = faixas[i][0] - faixas[i - 1][1] - 1;
    if (vazio > 0) buracos.push({ meses: vazio, depoisDe: faixas[i - 1][1], antesDe: faixas[i][0] });
  }
  return buracos;
}

/* ── Derivações de alto nível ───────────────────────────────────────────── */

/** Ordena do mais recente para o mais antigo. Em curso vem sempre primeiro. */
export function ordenarPorRecencia(experiencias) {
  return [...experiencias].sort((a, b) => {
    if ((a.fim == null) !== (b.fim == null)) return a.fim == null ? -1 : 1;
    return paraMeses(b.inicio) - paraMeses(a.inicio);
  });
}

/** Faixa completa coberta pela linha do tempo: menor início → ano corrente. */
export function faixaDaLinha(experiencias, referencia = new Date()) {
  const inicios = experiencias.map((e) => paraMeses(e.inicio));
  const min = Math.min(...inicios);
  return { anoInicial: Math.floor((min - 1) / 12), anoFinal: referencia.getFullYear() };
}

const _relFmt = {};

/** "há 3 dias" / "3 days ago" — usado no painel de visitas. */
export function haQuantoTempo(iso, idioma = 'pt', referencia = new Date()) {
  const chave = LOCALE[idioma];
  _relFmt[chave] ??= new Intl.RelativeTimeFormat(chave, { numeric: 'auto' });
  const seg = Math.round((new Date(iso) - referencia) / 1000);
  const escala = [
    ['second', 60], ['minute', 60], ['hour', 24],
    ['day', 7], ['week', 4.35], ['month', 12], ['year', Infinity],
  ];
  let valor = seg;
  for (const [unidade, passo] of escala) {
    if (Math.abs(valor) < passo) return _relFmt[chave].format(Math.round(valor), unidade);
    valor /= passo;
  }
  return _relFmt[chave].format(Math.round(valor), 'year');
}
