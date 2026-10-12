/**
 * 404.html: o GitHub Pages serve este arquivo para qualquer endereço que não
 * existe. Bilíngue numa página só, porque não há como saber o idioma de quem
 * chegou. Leva de volta ao que existe, sem drama.
 */

import { esc, rotulo, documento, ROTAS } from './base.mjs';

export function paginaNaoEncontrada() {
  const corpo = `<main id="conteudo" class="nao-encontrada">
  <h1 class="nao-encontrada__titulo">404</h1>
  <p class="nao-encontrada__texto">${esc(rotulo('pt', 'naoEncontradaTexto'))}</p>
  <p class="nao-encontrada__texto" lang="en">${esc(rotulo('en', 'naoEncontradaTexto'))}</p>
  <ul class="nao-encontrada__caminhos" role="list">
    <li><a class="elo elo--seta" href="${ROTAS.pt.inicio}">${esc(rotulo('pt', 'voltar'))}</a></li>
    <li><a class="elo elo--seta" href="${ROTAS.pt.projetos}">${esc(rotulo('pt', 'projetos'))}</a></li>
    <li><a class="elo elo--seta" href="${ROTAS.pt.curriculo}">${esc(rotulo('pt', 'curriculoTitulo'))}</a></li>
    <li lang="en"><a class="elo elo--seta" href="${ROTAS.en.inicio}">${esc(rotulo('en', 'voltar'))}</a></li>
  </ul>
</main>`;
  return documento({
    idioma: 'pt',
    chave: '404',
    titulo: `${rotulo('pt', 'naoEncontrada')} | Bruno Galiz`,
    descricao: rotulo('pt', 'naoEncontradaTexto'),
    corpo,
    classe: 'pagina-404',
  });
}
