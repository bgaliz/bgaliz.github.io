/**
 * /projetos/ e /en/projects/
 * Índice em tipografia grande; no desktop, passar o ponteiro revela a imagem
 * da prévia de link num painel fixo. Abaixo, um bloco por projeto. A prévia
 * vem dos metadados do próprio site do projeto (dados/previas.json), como o
 * WhatsApp faz ao colar uma URL: nenhum print feito à mão.
 */

import { esc, t, rotulo, documento, previa } from './base.mjs';
import { projetos, PERFIL } from './dados.mjs';
import { jsonldProjetos } from '../saidas/jsonld.mjs';

export const FRAMES_PROJETOS = ['https://cronometro-speacher.vercel.app'];

export function paginaProjetos(idioma, { previas = {}, ref = new Date() } = {}) {
  const lista = projetos(idioma);
  const pt = idioma === 'pt';

  const indice = lista.map((p) => {
    const img = previas[p.id]?.imagem;
    return `      <li><a class="indice-projetos__item" href="#projeto-${p.id}" data-previa="${img ? esc(img) : ''}" data-nome="${esc(p.nome)}">
        <span class="indice-projetos__nome">${esc(p.nome)}</span>
        <span class="indice-projetos__ano">${p.ano}</span>
        <span class="indice-projetos__linha">${esc(t(p.texto.linha, idioma))}</span>
      </a></li>`;
  }).join('\n');

  const blocos = lista.map((p) => projeto(idioma, p, previas[p.id])).join('\n');

  const corpo = `<main id="conteudo" class="pagina-projetos">
  <header class="pagina-cabeca">
    <h1 class="pagina-cabeca__titulo">${esc(rotulo(idioma, 'projetos'))}</h1>
    <p class="pagina-cabeca__texto">${esc(rotulo(idioma, 'projetosTexto'))}</p>
  </header>
  <div class="indice-projetos" data-indice-projetos>
    <ol class="indice-projetos__lista" role="list">
${indice}
    </ol>
    <div class="indice-projetos__painel" aria-hidden="true" data-painel-previa><img alt="" width="800" height="420"><p class="indice-projetos__sem-imagem"></p></div>
  </div>
${blocos}
</main>`;

  return documento({
    idioma,
    chave: 'projetos',
    titulo: pt ? 'Projetos pessoais | Bruno Galiz' : 'Personal projects | Bruno Galiz',
    descricao: `${pt ? 'Projetos pessoais de Bruno Galiz' : 'Personal projects by Bruno Galiz'}: ${
      new Intl.ListFormat(pt ? 'pt-BR' : 'en', { type: 'conjunction' }).format(lista.map((p) => p.nome))}.`,
    corpo,
    classe: 'pagina-de-projetos',
    jsonld: jsonldProjetos(idioma, ref),
  });
}

function projeto(idioma, p, prev) {
  const tx = p.texto;
  const porque = t(tx.porque, idioma);
  const assunto = encodeURIComponent(`${p.nome}: ${rotulo(idioma, 'codigoSobPedido').toLowerCase()}`);
  const links = [
    p.url ? `<a class="elo elo--seta" href="${esc(p.url)}" rel="noopener" data-cta="abrir-${p.id}">${esc(rotulo(idioma, 'abrir'))}<span aria-hidden="true"> ↗</span></a>` : '',
    ...(p.repos || []).map((r) => `<a class="elo elo--seta" href="${esc(r)}" rel="noopener" data-cta="codigo-${p.id}">${esc(rotulo(idioma, 'verCodigo'))} (${esc(r.split('/').pop())})<span aria-hidden="true"> ↗</span></a>`),
    p.privado ? `<a class="elo" href="mailto:${PERFIL.contato.email}?subject=${assunto}" data-cta="pedir-${p.id}">${esc(rotulo(idioma, 'codigoSobPedido'))}</a>` : '',
  ].filter(Boolean);

  const demo = p.id === 'cronometro' ? `
    <div class="demo-embutido" data-demo-embutido="${esc(p.url)}">
      <button type="button" class="botao" data-demo-abrir><span>${idioma === 'pt' ? 'Testar aqui mesmo' : 'Try it right here'}</span></button>
    </div>` : '';

  return `  <article class="projeto projeto--${p.id}" id="projeto-${p.id}" aria-labelledby="t-${p.id}" data-secao-obs="projeto-${p.id}">
    <header class="projeto__cabeca">
      <h2 class="projeto__nome" id="t-${p.id}">${esc(p.nome)}</h2>
      <p class="projeto__meta"><span>${p.ano}</span> <span>${esc(t(tx.estado, idioma))}</span></p>
    </header>
    <div class="projeto__corpo">
      <div class="projeto__texto">
        <p class="projeto__linha">${esc(t(tx.linha, idioma))}</p>${porque ? `
        <h3 class="projeto__sub">${esc(rotulo(idioma, 'porQue'))}</h3>
        <p>${esc(porque)}</p>` : ''}
        <h3 class="projeto__sub">${esc(rotulo(idioma, 'decisoes'))}</h3>
        <ul class="projeto__decisoes">
          ${tx.decisoes.map((d) => `<li>${esc(t(d, idioma))}</li>`).join('\n          ')}
        </ul>
        <p class="projeto__stack"><span>${esc(rotulo(idioma, 'tecnologias'))}:</span> ${esc(p.stackNomes.join(', '))}</p>
        <p class="projeto__links">${links.join(' ')}</p>
      </div>
      <div class="projeto__previa">
        ${previa(prev, { url: p.url, titulo: p.nome, descricao: t(tx.linha, idioma), idioma, rastro: `previa-${p.id}` })}${demo}
      </div>
    </div>
  </article>`;
}

