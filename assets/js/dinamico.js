/**
 * DERIVAÇÃO DOS VALORES TEMPORAIS
 * ══════════════════════════════════════════════════════════════════════════
 * Produz o catálogo de slots `data-din` a partir de perfil.js + tempo.js, e
 * o aplica no DOM. O MESMO catálogo é consumido por ferramentas/construir.mjs
 * para injetar os valores no HTML servido — por isso `calcularSlots` não pode
 * tocar no DOM nem depender de `window`.
 *
 * Resultado: o valor exibido nunca é escrito à mão. O portfólio não envelhece
 * sozinho, que foi exatamente o que aconteceu com o "5+ anos" do currículo
 * (de jan/2019 até hoje já são 7 anos).
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  duracao, formatarDuracao, periodoLegivel, anosDesde,
  faixaDaLinha, ordenarPorRecencia, uniaoDeMeses,
} from './tempo.js';
import {
  PERFIL, EXPERIENCIAS, FORMACAO, IDIOMAS, TECNOLOGIAS, DOMINIOS,
} from '../dados/perfil.js';

const ROTULOS = {
  pt: { atual: 'atual', anos: 'anos', ha: (t) => `há ${t}` },
  en: { atual: 'current', anos: 'years', ha: (t) => `${t} ago` },
};

/**
 * Catálogo completo de slots. Chave = valor de `data-din` no HTML.
 * @param {'pt'|'en'} idioma
 * @param {Date} ref  data de referência (parametrizável para viagem no tempo)
 */
export function calcularSlots(idioma = 'pt', ref = new Date()) {
  const r = ROTULOS[idioma];
  const s = {};

  /* ── Perfil ───────────────────────────────────────────────────────────── */
  s['perfil.desdeAno'] = PERFIL.inicioCarreira.slice(0, 4);
  s['perfil.anosCarreira'] = String(anosDesde(PERFIL.inicioCarreira, ref));
  s['perfil.anosCarreiraTexto'] =
    formatarDuracao({ anos: anosDesde(PERFIL.inicioCarreira, ref), meses: 0 }, idioma);
  s['perfil.prazoResposta'] = String(PERFIL.prazoRespostaH);

  const comoDev = EXPERIENCIAS.filter((e) => e.contaComoDev);
  s['perfil.mesesAtivos'] = formatarDuracao(uniaoDeMeses(comoDev, ref), idioma);

  /* ── Um bloco por experiência ─────────────────────────────────────────── */
  for (const e of EXPERIENCIAS) {
    s[`cargo.${e.id}.periodo`]  = periodoLegivel(e.inicio, e.fim, idioma);
    s[`cargo.${e.id}.duracao`]  = formatarDuracao(duracao(e.inicio, e.fim, ref), idioma);
    s[`cargo.${e.id}.anoInicio`] = e.inicio.slice(0, 4);
    s[`cargo.${e.id}.rotuloAtual`] = e.fim == null ? r.atual : '';
  }

  /* ── Etiquetas dos recortes (003) ─────────────────────────────────────── */
  // Faixa curta, só com anos. Em curso vira "2025 — atual"; encerrada no
  // mesmo ano vira só o ano; caso contrário, "2022—2024".
  for (const e of EXPERIENCIAS) {
    if (!e.recorte) continue;
    const ini = e.inicio.slice(0, 4);
    if (e.fim == null) s[`caso.${e.id}.anos`] = `${ini} — ${r.atual}`;
    else {
      const fim = e.fim.slice(0, 4);
      s[`caso.${e.id}.anos`] = ini === fim ? ini : `${ini}—${fim}`;
    }
  }

  /* ── Formação ─────────────────────────────────────────────────────────── */
  for (const f of FORMACAO) {
    s[`formacao.${f.id}.periodo`] = `${f.inicio.slice(0, 4)} — ${f.fim.slice(0, 4)}`;
    s[`formacao.${f.id}.ha`] = r.ha(
      formatarDuracao({ anos: anosDesde(f.fim, ref), meses: 0 }, idioma)
    );
  }

  /* ── Idiomas ──────────────────────────────────────────────────────────── */
  for (const i of IDIOMAS) {
    if (i.desde) s[`idioma.${i.id}.anos`] = String(anosDesde(i.desde, ref));
    if (i.cursos?.length) {
      // "Wizard (2011—2013) · inFlux (2021—2023)" montado dos dados, para que
      // corrigir uma data em perfil.js não deixe o HTML discordando.
      s[`idioma.${i.id}.cursos`] = i.cursos
        .map((c) => `${c.nome} (${c.inicio.slice(0, 4)}—${c.fim.slice(0, 4)})`)
        .join(' · ');
    }
  }

  /* ── Contagens derivadas dos dados, nunca digitadas ───────────────────── */
  s['contagem.empresas'] = String(EXPERIENCIAS.length);
  s['contagem.dominios'] = String(
    new Set(EXPERIENCIAS.filter((e) => e.dominio !== 'ti').map((e) => e.dominio)).size
  );
  s['contagem.tecnologias'] = String(TECNOLOGIAS.length);
  s['contagem.recortes'] = String(EXPERIENCIAS.filter((e) => e.recorte).length);
  s['contagem.recortesDominios'] = String(
    new Set(EXPERIENCIAS.filter((e) => e.recorte).map((e) => e.dominio)).size
  );

  /* ── Linha do tempo e site ────────────────────────────────────────────── */
  const faixa = faixaDaLinha(EXPERIENCIAS, ref);
  s['linha.faixa'] = `${faixa.anoInicial} — ${faixa.anoFinal}`;
  s['site.ano'] = String(ref.getFullYear());
  s['site.atualizado'] = new Intl.DateTimeFormat(
    idioma === 'pt' ? 'pt-BR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }
  ).format(ref).replace(/\./g, '').replace(/\bde\b\s*/g, '').trim();
  s['site.atualizadoISO'] = ref.toISOString().slice(0, 10);

  /* ── Meta description: também embute tempo, também é gerada ───────────── */
  const dominios = [...new Set(EXPERIENCIAS.filter((e) => e.recorte).map((e) => e.dominio))]
    .map((d) => DOMINIOS[d][idioma]).join(', ');
  s['meta.descricao'] = idioma === 'pt'
    ? `Desenvolvedor full-stack desde ${s['perfil.desdeAno']}. ${cap(dominios)} — Vue, React, Node e Java. Campo Grande, MS · remoto.`
    : `Full-stack developer since ${s['perfil.desdeAno']}. ${cap(dominios)} — Vue, React, Node and Java. Campo Grande, Brazil · remote.`;

  return s;
}

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/* ══════════════════════════════════════════════════════════════════════════
   APLICAÇÃO NO DOM
   ══════════════════════════════════════════════════════════════════════════ */

export function aplicarSlots(idioma = 'pt', raiz = document, ref = new Date()) {
  const slots = calcularSlots(idioma, ref);

  for (const el of raiz.querySelectorAll('[data-din]')) {
    const chave = el.dataset.din;
    const valor = slots[chave];
    if (valor == null) continue;

    if (el.tagName === 'META') el.setAttribute('content', valor);
    else el.textContent = valor;

    // <time> precisa do datetime legível por máquina, não só do texto.
    if (el.tagName === 'TIME' && slots['site.atualizadoISO']) {
      el.setAttribute('datetime', slots['site.atualizadoISO']);
    }
  }

  // O rótulo "atual" vem de fim === null, renderizado por pseudo-elemento.
  // Os seletores são atributos, não classes: um redesenho da folha de estilo
  // não pode desligar isto em silêncio. O atributo cai no [data-selo] porque
  // attr() só enxerga o elemento de origem do ::after.
  for (const item of raiz.querySelectorAll('[data-atual="sim"]')) {
    const id = item.querySelector('[data-din^="cargo."]')?.dataset.din?.split('.')[1];
    if (!id) continue;
    const rotulo = slots[`cargo.${id}.rotuloAtual`];
    if (rotulo) item.querySelector('[data-selo]')?.setAttribute('data-rotulo-atual', rotulo);
  }

  return slots;
}
