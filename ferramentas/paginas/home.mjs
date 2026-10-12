/**
 * HOME: O CURRÍCULO VIVO
 * ══════════════════════════════════════════════════════════════════════════
 * A ordem e os títulos são os de um currículo (Resumo, Experiência,
 * Projetos, Competências, Formação, Contato): é o que o robô do recrutador
 * reconhece como campo. A história, o ano que rola e o relatório interativo
 * vivem DENTRO da Experiência, como camada para a pessoa; para a máquina, a
 * mesma página continua sendo um currículo em ordem de leitura.
 *
 * Regra que não se negocia: todo texto está no HTML e visível sem JS e sem
 * rolar. Animação só desloca (transform), nunca esconde.
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  esc, t, rotulo, documento, previa, ROTAS, SITE,
} from './base.mjs';
import { cargos, emParalelo, projetos, competencias, formacao, idiomas, PERFIL } from './dados.mjs';
import {
  PESSOA, RESUMO, AREAS_TEXTO, COMO_TRABALHO, CONTATO,
} from '../../conteudo/curriculo.mjs';
import { jsonldPessoa } from '../saidas/jsonld.mjs';
import { TECNOLOGIAS } from '../../assets/dados/perfil.js';

const ANO_INICIAL = 2018;

export function paginaInicio(idioma, { previas = {}, ref = new Date() } = {}) {
  const lista = cargos(idioma);
  const paralelos = emParalelo(lista);
  const pdf = `/curriculo/bruno-galiz-${idioma}.pdf`;

  const corpo = `<main id="conteudo">
${topo(idioma, pdf)}
${secaoResumo(idioma)}
${secaoExperiencia(idioma, lista, paralelos, previas, ref)}
${secaoProjetos(idioma, previas)}
${secaoCompetencias(idioma, ref)}
${secaoFormacao(idioma)}
${secaoContato(idioma)}
</main>`;

  return documento({
    idioma,
    chave: 'inicio',
    titulo: idioma === 'pt'
      ? 'Bruno Galiz | Desenvolvedor Full Stack Pleno (Java, Vue.js, React)'
      : 'Bruno Galiz | Mid-level Full Stack Developer (Java, Vue.js, React)',
    descricao: t(RESUMO, idioma),
    corpo,
    classe: 'pagina-inicio',
    jsonld: jsonldPessoa(idioma, { pagina: 'inicio' }),
    preload: [
      `<link rel="preload" as="image" href="/assets/img/retrato/bruno-3x4-640.webp" type="image/webp" imagesrcset="/assets/img/retrato/bruno-3x4-480.webp 480w, /assets/img/retrato/bruno-3x4-640.webp 640w, /assets/img/retrato/bruno-3x4-960.webp 960w" imagesizes="(min-width: 64rem) 22rem, 70vw" fetchpriority="high">`,
    ],
  });
}

/* ── 1. Cabeçalho do currículo ─────────────────────────────────────────── */

function topo(idioma, pdf) {
  const c = PERFIL.contato;
  const assunto = encodeURIComponent(t(CONTATO.emailAssunto, idioma));
  return `<header class="cv-topo" id="topo">
  <div class="cv-topo__texto">
    <h1 class="cv-topo__nome" data-nome><span>Bruno</span> <span>Galiz</span></h1>
    <p class="cv-topo__cargo">${esc(t(PESSOA.cargo, idioma))}</p>
    <p class="cv-topo__stack">${esc(PESSOA.stackChave)}</p>
    <p class="cv-topo__local">${esc(t(PESSOA.local, idioma))}</p>
    <p class="cv-topo__estado"><span class="ponto-vivo" aria-hidden="true"></span>${esc(t(PESSOA.disponibilidade, idioma))}</p>
    <ul class="cv-topo__acoes" role="list">
      <li><a class="botao botao--principal" href="${pdf}" download data-cta="cv-${idioma}"><span>${esc(rotulo(idioma, 'baixarCurriculo'))}</span><span class="botao__seta" aria-hidden="true">↓</span></a></li>
      <li><a class="elo" href="${c.linkedin}" rel="me noopener" data-cta="linkedin">LinkedIn</a></li>
      <li><a class="elo" href="${c.github}" rel="me noopener" data-cta="github">GitHub</a></li>
      <li><a class="elo" href="mailto:${c.email}?subject=${assunto}" data-cta="email">${esc(c.email)}</a></li>
    </ul>
  </div>
  <figure class="retrato" data-retrato>
    <picture>
      <source type="image/webp" srcset="/assets/img/retrato/bruno-3x4-480.webp 480w, /assets/img/retrato/bruno-3x4-640.webp 640w, /assets/img/retrato/bruno-3x4-960.webp 960w" sizes="(min-width: 64rem) 22rem, 70vw">
      <img src="/assets/img/retrato/bruno-3x4-960.jpg" width="960" height="1280" alt="Bruno Galiz" fetchpriority="high">
    </picture>
    <span class="retrato__marcas" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  </figure>
</header>`;
}

/* ── 2. Resumo ─────────────────────────────────────────────────────────── */

function secaoResumo(idioma) {
  return `<section class="secao secao--resumo" id="resumo" aria-labelledby="t-resumo" data-secao-obs="resumo">
  <h2 class="secao__titulo" id="t-resumo">${esc(rotulo(idioma, 'resumo'))}</h2>
  <p class="resumo">${esc(t(RESUMO, idioma))}</p>
</section>`;
}

/* ── 3. Experiência em modo história ───────────────────────────────────── */

function secaoExperiencia(idioma, lista, paralelos, previas, ref) {
  const anoFinal = ref.getFullYear();
  const devs = lista.filter((c) => !c.discreto);
  const primeiro = lista[0];

  return `<section class="secao secao--experiencia" id="experiencia" aria-labelledby="t-exp" data-secao-obs="experiencia">
  <h2 class="secao__titulo" id="t-exp">${esc(rotulo(idioma, 'experiencia'))}</h2>
  <div class="historia">
    <div class="historia__tempo" aria-hidden="true">
      ${odometro(primeiro.anoInicio)}
      ${regua(lista, ANO_INICIAL, anoFinal)}
    </div>
    <ol class="historia__cargos" role="list">
${lista.map((c) => cargo(idioma, c, paralelos.has(c.id), previas)).join('\n')}
    </ol>
  </div>
${relatorio(idioma, devs)}
</section>`;
}

function odometro(ano) {
  const digitos = [...String(ano)].map((d) => `<span class="odometro__digito" style="--d:${d}">${'0123456789'.split('').map((n) => `<span>${n}</span>`).join('')}</span>`).join('');
  return `<p class="odometro" data-odometro>${digitos}</p>`;
}

/** A régua da carreira: um traço por cargo, posicionado por mês. A lacuna
 *  2024-25 aparece como trecho vazio, sem texto (decisão do Bruno). */
function regua(lista, anoIni, anoFim) {
  const total = (anoFim - anoIni + 1) * 12;
  const pos = (aaaamm) => {
    const [a, m] = aaaamm.split('-').map(Number);
    return (((a - anoIni) * 12 + (m - 1)) / total) * 100;
  };
  const hoje = `${anoFim}-12`;
  const tracos = lista.map((c) => {
    const ini = pos(c.inicio);
    const fim = pos(c.fim ?? hoje) + 100 / total;
    return `<span class="regua__traco${c.discreto ? ' regua__traco--ti' : ''}${c.freelance ? ' regua__traco--paralelo' : ''}" data-cargo="${c.id}" style="--ini:${ini.toFixed(2)}%;--fim:${fim.toFixed(2)}%"></span>`;
  }).join('');
  // Rótulo a cada dois anos: nove anos lado a lado não cabem numa coluna
  // estreita, e o ano exato de cada cargo já está escrito no capítulo.
  const anos = Array.from({ length: anoFim - anoIni + 1 }, (_, i) => anoIni + i)
    .filter((a) => (a - anoIni) % 2 === 0)
    .map((a) => `<span class="regua__ano" style="--ini:${pos(`${a}-01`).toFixed(2)}%">${a}</span>`).join('');
  return `<div class="regua">${tracos}${anos}<span class="regua__marca" data-regua-marca></span></div>`;
}

function cargo(idioma, c, paralelo, previas) {
  const tx = c.texto;
  const modalidade = c.modalidade ? rotulo(idioma, c.modalidade) : '';
  const fim = c.atual
    ? esc(c.fimTexto)
    : `<time datetime="${c.fim}">${esc(c.fimTexto)}</time>`;
  const linhaCargo = [t(tx.cargo, idioma), modalidade, paralelo ? rotulo(idioma, 'paralelo') : '']
    .filter(Boolean).map(esc).join(', ');

  const topicos = [
    `<li class="cargo__principal">${esc(t(tx.principal, idioma))}</li>`,
    ...tx.apoio.map((a) => `<li>${esc(t(a, idioma))}</li>`),
  ].join('\n          ');

  const caso = tx.caso ? `
        <details class="caso" data-rastro="caso-${c.id}">
          <summary>${esc(rotulo(idioma, 'casoCompleto'))}</summary>
          <dl class="caso__corpo">
            <dt>${esc(rotulo(idioma, 'problema'))}</dt><dd>${esc(t(tx.caso.problema, idioma))}</dd>
            <dt>${esc(rotulo(idioma, 'decisao'))}</dt><dd>${esc(t(tx.caso.decisao, idioma))}</dd>
            <dt>${esc(rotulo(idioma, 'resultado'))}</dt><dd>${esc(t(tx.caso.resultado, idioma))}</dd>
          </dl>${c.id === 'conexa' ? demoCampo(idioma) : ''}
        </details>` : '';

  const levei = t(tx.levei, idioma)
    ? `\n        <p class="cargo__levei"><span>${esc(rotulo(idioma, 'levei'))}:</span> ${esc(t(tx.levei, idioma))}</p>` : '';

  const url = c.url;
  const cartao = url ? `\n        ${previa(previas[c.id], {
    url, titulo: c.empresa, descricao: t(tx.contexto, idioma), idioma, rastro: `previa-${c.id}`,
  })}` : '';

  return `      <li class="cargo${c.discreto ? ' cargo--discreto' : ''}" id="cargo-${c.id}" data-ano="${c.anoInicio}" data-cargo="${c.id}">
        <article aria-labelledby="t-cargo-${c.id}">
        <p class="cargo__quando"><time datetime="${c.inicio}">${esc(c.inicioTexto)}</time> - ${fim}${c.discreto ? '' : ` <span class="cargo__duracao" data-din="cargo.${c.id}.duracao"></span>`}</p>
        <h3 class="cargo__empresa" id="t-cargo-${c.id}">${esc(c.empresa)}</h3>
        <p class="cargo__papel">${linhaCargo}${t(tx.contexto, idioma) ? `. ${esc(t(tx.contexto, idioma))}` : ''}</p>
        <ul class="cargo__topicos">
          ${topicos}
        </ul>${c.stackNomes.length ? `
        <p class="cargo__stack"><span>${esc(rotulo(idioma, 'tecnologias'))}:</span> ${esc(c.stackNomes.join(', '))}</p>` : ''}${caso}${levei}${cartao}
        </article>
      </li>`;
}

/** Mini demonstração REAL do caso Conexa: o visitante cria um campo no
 *  formulário e ele aparece na hora, sem deploy. Sem JS, o formulário fica
 *  estático e a explicação continua inteira no texto acima. */
function demoCampo(idioma) {
  const pt = idioma === 'pt';
  return `
          <div class="demo-campo" data-demo-campo>
            <p class="demo-campo__titulo">${pt ? 'Experimente: crie um campo no prontuário' : 'Try it: add a field to the record'}</p>
            <form class="demo-campo__criar">
              <label>${pt ? 'Nome do campo' : 'Field name'} <input name="rotulo" maxlength="40" autocomplete="off" placeholder="${pt ? 'Ex.: Alergias' : 'e.g. Allergies'}" required></label>
              <label>${pt ? 'Tipo' : 'Type'} <select name="tipo"><option value="text">${pt ? 'texto' : 'text'}</option><option value="date">${pt ? 'data' : 'date'}</option><option value="checkbox">${pt ? 'sim ou não' : 'yes or no'}</option></select></label>
              <button type="submit" class="botao">${pt ? 'Criar campo' : 'Add field'}</button>
            </form>
            <fieldset class="demo-campo__ficha">
              <legend>${pt ? 'Prontuário da clínica' : "Clinic's record"}</legend>
              <label>${pt ? 'Paciente' : 'Patient'} <input value="${pt ? 'Maria Souza' : 'Maria Souza'}" readonly></label>
              <label>${pt ? 'Queixa principal' : 'Chief complaint'} <input value="${pt ? 'Dor de cabeça há 3 dias' : 'Headache for 3 days'}" readonly></label>
            </fieldset>
            <p class="demo-campo__nota">${pt ? 'Dados de exemplo. No sistema real, o campo vira configuração da clínica, e nenhum deploy acontece.' : 'Sample data. In the real system the field becomes clinic configuration, and no deploy happens.'}</p>
          </div>`;
}

/* ── 3b. Monte o relatório de mim ──────────────────────────────────────── */

const COLUNAS = ['empresa', 'periodo', 'cargo', 'entrega', 'dominio', 'stack'];
const COLUNAS_PADRAO = new Set(['empresa', 'periodo', 'cargo', 'entrega', 'stack']);
const ROTULO_COL = {
  empresa: 'colEmpresa', periodo: 'colPeriodo', cargo: 'colCargo',
  entrega: 'colEntrega', dominio: 'colDominio', stack: 'colStack',
};

function relatorio(idioma, lista) {
  const usados = new Set(lista.flatMap((c) => c.stack));
  const tecs = TECNOLOGIAS.filter((x) => usados.has(x.id) && !['git', 'scrum', 'rest'].includes(x.id))
    .map((x) => ({ id: x.id, nome: idioma === 'en' && x.en ? x.en : x.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, idioma));
  const dominios = [...new Map(lista.map((c) => [c.dominio, c.dominioTexto])).entries()];

  const linhas = lista.map((c) => `
          <tr data-stack="${c.stack.join(' ')}" data-dominio="${c.dominio}">
            <td data-col="empresa">${esc(c.empresa)}</td>
            <td data-col="periodo">${esc(c.inicioTexto)} - ${esc(c.fimTexto)}</td>
            <td data-col="cargo">${esc(t(c.texto.cargo, idioma))}</td>
            <td data-col="entrega">${esc(t(c.texto.principal, idioma))}</td>
            <td data-col="dominio">${esc(c.dominioTexto)}</td>
            <td data-col="stack">${esc(c.stackNomes.join(', '))}</td>
          </tr>`).join('');

  return `  <section class="relatorio" id="relatorio" aria-labelledby="t-relatorio" data-relatorio data-secao-obs="relatorio">
    <div class="relatorio__cabeca">
      <h3 class="relatorio__titulo" id="t-relatorio">${esc(rotulo(idioma, 'relatorio'))}</h3>
      <p class="relatorio__texto">${esc(rotulo(idioma, 'relatorioTexto'))}</p>
    </div>
    <form class="relatorio__controles" data-relatorio-controles hidden>
      <fieldset class="relatorio__colunas">
        <legend>${esc(rotulo(idioma, 'colunas'))}</legend>
        ${COLUNAS.map((k) => `<label><input type="checkbox" name="col" value="${k}"${COLUNAS_PADRAO.has(k) ? ' checked' : ''}> ${esc(rotulo(idioma, ROTULO_COL[k]))}</label>`).join('\n        ')}
      </fieldset>
      <div class="relatorio__filtros">
        <label>${esc(rotulo(idioma, 'filtroTecnologia'))}
          <select name="tec"><option value="">${esc(rotulo(idioma, 'todas'))}</option>${tecs.map((x) => `<option value="${x.id}">${esc(x.nome)}</option>`).join('')}</select>
        </label>
        <label>${esc(rotulo(idioma, 'filtroDominio'))}
          <select name="dominio"><option value="">${esc(rotulo(idioma, 'todas'))}</option>${dominios.map(([id, nome]) => `<option value="${id}">${esc(nome)}</option>`).join('')}</select>
        </label>
      </div>
      <div class="relatorio__acoes">
        <button type="button" class="botao botao--principal" data-relatorio-pdf><span>${esc(rotulo(idioma, 'gerarPdf'))}</span></button>
        <button type="button" class="botao" data-relatorio-copiar data-rotulo-ok="${esc(rotulo(idioma, 'copiado'))}"><span>${esc(rotulo(idioma, 'copiarTexto'))}</span></button>
      </div>
    </form>
    <div class="relatorio__folha" data-relatorio-folha>
      <div class="relatorio__impresso">
        <img src="/assets/img/retrato/bruno-reticula.webp" width="240" height="320" alt="" fetchpriority="low">
        <p><strong>Bruno Galiz</strong>, ${esc(t(PESSOA.cargo, idioma))}<br>${esc(PERFIL.contato.email)}, ${SITE.replace('https://', '')}</p>
      </div>
      <div class="tabela-rolagem">
        <table class="tabela">
          <thead><tr>${COLUNAS.map((k) => `<th scope="col" data-col="${k}">${esc(rotulo(idioma, ROTULO_COL[k]))}</th>`).join('')}</tr></thead>
          <tbody>${linhas}
          </tbody>
        </table>
      </div>
    </div>
  </section>`;
}

/* ── 4. Projetos (faixa) ───────────────────────────────────────────────── */

function secaoProjetos(idioma, previas) {
  const r = ROTAS[idioma];
  const itens = projetos(idioma).map((p) => `
    <li class="faixa__item">${previa(previas[p.id], {
    url: p.url, titulo: p.nome, descricao: t(p.texto.linha, idioma), idioma, rastro: `projeto-${p.id}`,
  })}</li>`).join('');
  return `<section class="secao secao--projetos" id="projetos" aria-labelledby="t-projetos" data-secao-obs="projetos">
  <h2 class="secao__titulo" id="t-projetos">${esc(rotulo(idioma, 'projetos'))}</h2>
  <p class="secao__intro">${esc(rotulo(idioma, 'projetosTexto'))}</p>
  <ul class="faixa" role="list">${itens}
  </ul>
  <p><a class="elo elo--seta" href="${r.projetos}">${esc(rotulo(idioma, 'verProjetos'))}<span aria-hidden="true"> →</span></a></p>
</section>`;
}

/* ── 5. Competências ───────────────────────────────────────────────────── */

function secaoCompetencias(idioma, ref) {
  const grupos = competencias(idioma, ref).filter((g) => g.itens.length);
  const item = (x) => {
    const meta = [
      x.desde ? `${rotulo(idioma, 'desde')} ${x.desde}` : '',
      x.emUso ? rotulo(idioma, 'emUso') : '',
      x.fonte === 'projeto' ? rotulo(idioma, 'emProjetos') : '',
    ].filter(Boolean);
    return `<li${x.emUso ? ' class="em-uso"' : ''}><span class="comp__nome">${esc(x.nomeIdioma)}</span>${meta.length ? ` <span class="comp__meta">${esc(meta.join(', '))}</span>` : ''}</li>`;
  };
  return `<section class="secao secao--competencias" id="competencias" aria-labelledby="t-comp" data-secao-obs="competencias">
  <h2 class="secao__titulo" id="t-comp">${esc(rotulo(idioma, 'competencias'))}</h2>
  <div class="competencias">
${grupos.map((g) => `    <div class="comp-area comp-area--${g.area}">
      <h3 class="comp-area__titulo">${esc(t(AREAS_TEXTO[g.area], idioma))}</h3>
      <ul class="comp-area__lista" role="list">
        ${g.itens.map(item).join('\n        ')}
      </ul>${g.area === 'ia' ? `
      <h4 class="comp-area__subtitulo">${esc(rotulo(idioma, 'comoTrabalho'))}</h4>
      <p class="comp-area__texto">${esc(t(COMO_TRABALHO, idioma))}</p>` : ''}
    </div>`).join('\n')}
  </div>
</section>`;
}

/* ── 6. Formação e idiomas ─────────────────────────────────────────────── */

function secaoFormacao(idioma) {
  return `<section class="secao secao--formacao" id="formacao" aria-labelledby="t-form" data-secao-obs="formacao">
  <h2 class="secao__titulo" id="t-form">${esc(rotulo(idioma, 'formacao'))}</h2>
  <dl class="formacao">
${formacao(idioma).map((f) => `    <div class="formacao__item">
      <dt><span class="formacao__titulo">${esc(f.titulo)}</span> <span class="formacao__inst">${esc(f.instituicao)}</span></dt>
      <dd><span class="formacao__periodo">${esc(f.periodo)}</span> ${esc(f.detalhe)}</dd>
    </div>`).join('\n')}
${idiomas(idioma).map((i) => `    <div class="formacao__item">
      <dt><span class="formacao__titulo">${esc(i.nome)}</span></dt>
      <dd>${esc(i.nivel)}${i.cursosTexto ? `. ${esc(i.cursosTexto)}` : ''}</dd>
    </div>`).join('\n')}
  </dl>
</section>`;
}

/* ── 7. Contato ────────────────────────────────────────────────────────── */

function secaoContato(idioma) {
  const c = PERFIL.contato;
  const zap = `https://wa.me/${c.telefoneE164}?text=${encodeURIComponent(t(CONTATO.whatsappMensagem, idioma))}`;
  const assunto = encodeURIComponent(t(CONTATO.emailAssunto, idioma));
  return `<section class="secao secao--contato" id="contato" aria-labelledby="t-contato" data-secao-obs="contato">
  <h2 class="secao__titulo" id="t-contato">${esc(t(CONTATO.titulo, idioma))}</h2>
  <p class="contato__texto">${esc(t(CONTATO.texto, idioma))}</p>
  <div class="contato__email">
    <a class="contato__endereco" href="mailto:${c.email}?subject=${assunto}" data-cta="email">${esc(c.email)}</a>
    <button type="button" class="botao" data-copiar="${esc(c.email)}" data-copiar-rastro="email" data-rotulo-ok="${esc(rotulo(idioma, 'copiado'))}"><span>${esc(rotulo(idioma, 'copiarEmail'))}</span></button>
  </div>
  <ul class="contato__canais" role="list">
    <li><a class="elo" href="${c.linkedin}" rel="me noopener" data-cta="linkedin-contato">LinkedIn</a></li>
    <li><a class="elo" href="${zap}" rel="noopener" data-cta="whatsapp">WhatsApp</a></li>
    <li><a class="elo" href="${c.github}" rel="me noopener" data-cta="github-contato">GitHub</a></li>
  </ul>
  <ul class="contato__cv" role="list">
    <li><a href="/curriculo/bruno-galiz-pt.pdf" download data-cta="cv-pt">${esc(rotulo(idioma, 'curriculoPt'))}</a></li>
    <li><a href="/curriculo/bruno-galiz-en.pdf" download data-cta="cv-en">${esc(rotulo(idioma, 'curriculoEn'))}</a></li>
  </ul>
</section>`;
}
