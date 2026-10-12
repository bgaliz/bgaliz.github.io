/**
 * DADOS PRONTOS PARA AS PÁGINAS
 * Junta estrutura (perfil.js) e texto (curriculo.mjs) e já entrega datas
 * formatadas por idioma. As páginas e as saídas para máquina (JSON-LD, JSON
 * Resume, cv.txt) consomem daqui: uma junção só, para não divergirem.
 */

import {
  PERFIL, EXPERIENCIAS, PROJETOS, FORMACAO, IDIOMAS, TECNOLOGIAS, DOMINIOS,
} from '../../assets/dados/perfil.js';
import { CARGOS, PROJETOS_TEXTO, FORMACAO_TEXTO, IDIOMAS_TEXTO, ROTULOS } from '../../conteudo/curriculo.mjs';
import { formatarMesAno, ordenarPorRecencia } from '../../assets/js/tempo.js';
import { calcularCompetencias } from '../../assets/js/competencias.js';

const nomeTec = (id, idioma) => {
  const tec = TECNOLOGIAS.find((x) => x.id === id);
  return tec ? (idioma === 'en' && tec.en ? tec.en : tec.nome) : id;
};

/** Fora da linha "Tecnologias:" de um cargo: as práticas que valem para
 *  todos (Git, Scrum, APIs REST), que viram ruído repetidas sete vezes, e as
 *  que já estão escritas nos tópicos (SEO, legado, publicação nas lojas, IA).
 *  Todas continuam no cargo para o cálculo de "desde" e em Competências. */
const PRATICAS = new Set(['git', 'scrum', 'rest', 'seo', 'legado', 'mobile', 'ia']);

export function cargos(idioma) {
  return ordenarPorRecencia(EXPERIENCIAS).map((e) => {
    const texto = CARGOS[e.id];
    const atual = e.fim == null;
    return {
      ...e,
      texto,
      atual,
      inicioTexto: formatarMesAno(e.inicio, idioma),
      fimTexto: atual ? ROTULOS[idioma].atual : formatarMesAno(e.fim, idioma),
      anoInicio: e.inicio.slice(0, 4),
      dominioTexto: DOMINIOS[e.dominio]?.[idioma] ?? e.dominio,
      stackNomes: e.stack.filter((id) => !PRATICAS.has(id)).map((id) => nomeTec(id, idioma)),
      stackTodos: e.stack.map((id) => nomeTec(id, idioma)),
    };
  });
}

/** Cargos que se sobrepõem a outro (Calango, freelance em paralelo). */
export function emParalelo(lista) {
  return new Set(lista.filter((a) => lista.some((b) => b.id !== a.id && b.contaComoDev && a.freelance
    && a.inicio <= (b.fim ?? '9999-12') && (a.fim ?? '9999-12') >= b.inicio)).map((a) => a.id));
}

export function projetos(idioma) {
  return [...PROJETOS]
    .sort((a, b) => (b.fim ?? '9999-12').localeCompare(a.fim ?? '9999-12') || b.inicio.localeCompare(a.inicio))
    .map((p) => ({
      ...p,
      texto: PROJETOS_TEXTO[p.id],
      ano: p.inicio.slice(0, 4),
      stackNomes: p.stack.map((id) => nomeTec(id, idioma)),
    }));
}

export function competencias(idioma, ref = new Date()) {
  return calcularCompetencias(ref).map((g) => ({
    ...g,
    itens: g.itens.map((x) => ({ ...x, nomeIdioma: idioma === 'en' && x.en ? x.en : x.nome })),
  }));
}

export function formacao(idioma) {
  return FORMACAO.map((f) => ({
    ...f,
    titulo: FORMACAO_TEXTO[f.id].titulo[idioma],
    detalhe: FORMACAO_TEXTO[f.id].detalhe[idioma],
    periodo: `${f.inicio.slice(0, 4)} - ${f.fim.slice(0, 4)}`,
  }));
}

export function idiomas(idioma) {
  return IDIOMAS.map((i) => ({
    ...i,
    nome: IDIOMAS_TEXTO[i.id].nome[idioma],
    nivel: IDIOMAS_TEXTO[i.id].nivel[idioma],
    cursosTexto: (i.cursos || []).map((c) => `${c.nome} (${c.inicio.slice(0, 4)}-${c.fim.slice(0, 4)})`).join(', '),
  }));
}

export { PERFIL, nomeTec };
