/**
 * /curriculo/ e /en/resume/: o currículo em uma coluna
 * ══════════════════════════════════════════════════════════════════════════
 * A versão que ATS lê sem tropeçar: uma coluna, títulos padrão, texto puro,
 * nada em imagem, nada em tabela de layout. É também a FONTE dos PDFs
 * (ferramentas/gerar-pdf.mjs), então o PDF diz exatamente o que esta página
 * diz. Sem foto: parser ignora imagem, e há empresas que preferem triagem
 * sem rosto.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { esc, t, rotulo, documento, SITE, ROTAS } from './base.mjs';
import { cargos, projetos, competencias, formacao, idiomas, PERFIL } from './dados.mjs';
import { PESSOA, RESUMO, AREAS_TEXTO, COMO_TRABALHO } from '../../conteudo/curriculo.mjs';
import { jsonldPessoa } from '../saidas/jsonld.mjs';

export function paginaCurriculo(idioma, { ref = new Date() } = {}) {
  const c = PERFIL.contato;
  const pt = idioma === 'pt';
  const pdf = `/curriculo/bruno-galiz-${idioma}.pdf`;
  const txt = idioma === 'en' ? '/en/cv.txt' : '/cv.txt';

  const experiencia = cargos(idioma).map((x) => `
    <article class="cv-item">
      <h3 class="cv-item__titulo">${esc(t(x.texto.cargo, idioma))}, ${esc(x.empresa)}</h3>
      <p class="cv-item__meta"><time datetime="${x.inicio}">${esc(x.inicioTexto)}</time> - ${x.atual ? esc(x.fimTexto) : `<time datetime="${x.fim}">${esc(x.fimTexto)}</time>`}${x.modalidade ? `, ${esc(rotulo(idioma, x.modalidade))}` : ''}${t(x.texto.contexto, idioma) ? `. ${esc(t(x.texto.contexto, idioma))}` : ''}</p>
      <ul>
        <li>${esc(t(x.texto.principal, idioma))}</li>${x.texto.apoio.map((a) => `
        <li>${esc(t(a, idioma))}</li>`).join('')}
      </ul>${x.stackNomes.length ? `
      <p class="cv-item__stack">${esc(rotulo(idioma, 'tecnologias'))}: ${esc(x.stackNomes.join(', '))}</p>` : ''}
    </article>`).join('');

  const projs = projetos(idioma).map((p) => `
    <article class="cv-item">
      <h3 class="cv-item__titulo">${esc(p.nome)}</h3>
      <p class="cv-item__meta">${p.ano}${p.fim ? '' : ` - ${esc(rotulo(idioma, 'atual'))}`}. ${esc(t(p.texto.linha, idioma))}</p>
      <p class="cv-item__stack">${esc(rotulo(idioma, 'tecnologias'))}: ${esc(p.stackNomes.join(', '))}</p>
    </article>`).join('');

  const comps = competencias(idioma, ref).filter((g) => g.itens.length).map((g) => `
    <p><strong>${esc(t(AREAS_TEXTO[g.area], idioma))}:</strong> ${g.itens.map((x) => esc(x.desde ? `${x.nomeIdioma} (${rotulo(idioma, 'desde')} ${x.desde})` : x.nomeIdioma)).join(', ')}</p>`).join('');

  const corpo = `<main id="conteudo" class="cv">
  <div class="cv__acoes" data-nao-imprime>
    <p class="cv__intro">${esc(rotulo(idioma, 'curriculoIntro'))}</p>
    <a class="botao botao--principal" href="${pdf}" download data-cta="cv-${idioma}"><span>${esc(rotulo(idioma, 'baixarPdf'))}</span></a>
    <button type="button" class="botao" data-copiar-de="${txt}" data-copiar-rastro="curriculo" data-rotulo-ok="${esc(rotulo(idioma, 'copiado'))}"><span>${esc(rotulo(idioma, 'copiarTexto'))}</span></button>
    <button type="button" class="botao" data-imprimir><span>${esc(rotulo(idioma, 'imprimir'))}</span></button>
  </div>

  <header class="cv__cabeca">
    <h1 class="cv__nome">${esc(PERFIL.nomeCompleto)}</h1>
    <p class="cv__cargo">${esc(t(PESSOA.cargo, idioma))}. ${esc(PESSOA.stackChave)}.</p>
    <p class="cv__contato">${esc(PERFIL.local.cidade)}, ${esc(PERFIL.local.estado)}, ${pt ? 'Brasil' : 'Brazil'}. ${pt ? 'Remoto' : 'Remote'}.
      <a href="mailto:${c.email}">${esc(c.email)}</a>,
      <a href="${c.linkedin}">${esc(c.linkedin.replace('https://www.', ''))}</a>,
      <a href="${c.github}">${esc(c.github.replace('https://', ''))}</a>,
      <a href="${SITE}${ROTAS[idioma].inicio}">${esc(SITE.replace('https://', ''))}</a></p>
  </header>

  <section aria-labelledby="cv-resumo"><h2 id="cv-resumo">${esc(rotulo(idioma, 'resumo'))}</h2>
    <p>${esc(t(RESUMO, idioma))}</p>
  </section>

  <section aria-labelledby="cv-exp"><h2 id="cv-exp">${esc(rotulo(idioma, 'experiencia'))}</h2>${experiencia}
  </section>

  <section aria-labelledby="cv-proj"><h2 id="cv-proj">${esc(rotulo(idioma, 'projetos'))}</h2>${projs}
  </section>

  <section aria-labelledby="cv-comp"><h2 id="cv-comp">${esc(rotulo(idioma, 'competencias'))}</h2>${comps}
    <p><strong>${esc(rotulo(idioma, 'comoTrabalho'))}:</strong> ${esc(t(COMO_TRABALHO, idioma))}</p>
  </section>

  <section aria-labelledby="cv-form"><h2 id="cv-form">${esc(rotulo(idioma, 'formacao'))}</h2>
${formacao(idioma).map((f) => `    <p><strong>${esc(f.titulo)}</strong>, ${esc(f.instituicao)}, ${esc(f.periodo)}.</p>`).join('\n')}
${idiomas(idioma).map((i) => `    <p><strong>${esc(i.nome)}:</strong> ${esc(i.nivel)}.</p>`).join('\n')}
  </section>
</main>`;

  return documento({
    idioma,
    chave: 'curriculo',
    titulo: pt ? 'Currículo | Bruno Galiz, Desenvolvedor Full Stack Pleno' : 'Résumé | Bruno Galiz, Mid-level Full Stack Developer',
    descricao: t(RESUMO, idioma),
    corpo,
    classe: 'pagina-curriculo',
    jsonld: jsonldPessoa(idioma, { pagina: 'curriculo', ref }),
  });
}
