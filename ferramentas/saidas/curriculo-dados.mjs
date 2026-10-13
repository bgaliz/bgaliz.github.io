/**
 * CURRÍCULO PARA MÁQUINA: JSON RESUME, TEXTO PURO E LLMS.TXT
 * ══════════════════════════════════════════════════════════════════════════
 * JSON Resume (jsonresume.org, schema v1) é o formato aberto que ferramentas
 * de currículo e alguns ATS importam. O texto puro é o que um recrutador cola
 * no sistema dele, e o que um parser lê sem errar ordem de coluna. O
 * llms.txt (llmstxt.org) aponta leitores por IA para tudo isso.
 *
 * Todos saem da mesma junção de dados das páginas: o PDF, a página e estes
 * arquivos dizem exatamente a mesma coisa.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { SITE, ROTAS, t, rotulo } from '../paginas/base.mjs';
import { cargos, projetos, competencias, formacao, idiomas, PERFIL } from '../paginas/dados.mjs';
import { PESSOA, RESUMO, AREAS_TEXTO, COMO_TRABALHO } from '../../conteudo/curriculo.mjs';

/** +55 67 98114-2011 a partir de 5567981142011. */
export const telefone = (e164) => `+${e164.slice(0, 2)} ${e164.slice(2, 4)} ${e164.slice(4, 9)}-${e164.slice(9)}`;

export function jsonResume(idioma, ref = new Date()) {
  const lista = cargos(idioma).filter((c) => c.contaComoDev);
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: PERFIL.nomeCompleto,
      label: t(PESSOA.cargo, idioma),
      image: `${SITE}/assets/img/retrato/bruno-3x4-960.jpg`,
      email: PERFIL.contato.email,
      url: `${SITE}${ROTAS[idioma].inicio}`,
      summary: t(RESUMO, idioma),
      location: { city: PERFIL.local.cidade, region: PERFIL.local.estado, countryCode: PERFIL.local.pais },
      profiles: [
        { network: 'GitHub', username: 'bgaliz', url: PERFIL.contato.github },
        { network: 'LinkedIn', username: 'brunogaliz', url: PERFIL.contato.linkedin },
      ],
    },
    work: lista.map((c) => ({
      name: c.empresa,
      position: t(c.texto.cargo, idioma),
      ...(c.url ? { url: c.url } : {}),
      startDate: c.inicio,
      ...(c.fim ? { endDate: c.fim } : {}),
      summary: t(c.texto.contexto, idioma),
      highlights: [t(c.texto.principal, idioma), ...c.texto.apoio.map((a) => t(a, idioma))],
      keywords: c.stackTodos,
    })),
    projects: projetos(idioma).map((p) => ({
      name: p.nome,
      description: t(p.texto.linha, idioma),
      highlights: p.texto.decisoes.map((d) => t(d, idioma)),
      keywords: p.stackNomes,
      startDate: p.inicio,
      ...(p.fim ? { endDate: p.fim } : {}),
      ...(p.url ? { url: p.url } : {}),
      type: 'application',
    })),
    skills: competencias(idioma, ref).filter((g) => g.itens.length).map((g) => ({
      name: t(AREAS_TEXTO[g.area], idioma),
      keywords: g.itens.map((x) => x.nomeIdioma),
    })),
    education: formacao(idioma).map((f) => ({
      institution: f.instituicao,
      studyType: f.titulo,
      startDate: f.inicio,
      endDate: f.fim,
    })),
    languages: idiomas(idioma).map((i) => ({ language: i.nome, fluency: i.nivel })),
    meta: {
      canonical: `${SITE}/${idioma === 'en' ? 'resume.json' : 'curriculo.json'}`,
      lastModified: ref.toISOString().slice(0, 10),
    },
  };
}

/** Currículo em texto puro: uma coluna, títulos padrão, sem símbolo nenhum que
 *  um parser antigo possa engolir. */
export function textoPuro(idioma, ref = new Date()) {
  const L = [];
  const linha = (s = '') => L.push(s);
  const titulo = (s) => { linha(); linha(s.toUpperCase()); linha(); };
  const c = PERFIL.contato;

  linha(PERFIL.nomeCompleto);
  linha(t(PESSOA.cargo, idioma));
  linha(PESSOA.stackChave);
  linha(`${PERFIL.local.cidade}, ${PERFIL.local.estado}, ${idioma === 'pt' ? 'Brasil' : 'Brazil'}. ${idioma === 'pt' ? 'Remoto' : 'Remote'}.`);
  linha(`${c.email} | ${telefone(c.telefoneE164)} | ${c.linkedin} | ${c.github} | ${SITE}${ROTAS[idioma].inicio}`);

  titulo(rotulo(idioma, 'resumo'));
  linha(t(RESUMO, idioma));

  titulo(rotulo(idioma, 'experiencia'));
  for (const x of cargos(idioma)) {
    linha(`${t(x.texto.cargo, idioma)} | ${x.empresa}`);
    linha(`${x.inicioTexto} - ${x.fimTexto}${x.modalidade ? ` | ${rotulo(idioma, x.modalidade)}` : ''}`);
    if (t(x.texto.contexto, idioma)) linha(t(x.texto.contexto, idioma));
    linha(`- ${t(x.texto.principal, idioma)}`);
    for (const a of x.texto.apoio) linha(`- ${t(a, idioma)}`);
    if (x.stackNomes.length) linha(`${rotulo(idioma, 'tecnologias')}: ${x.stackNomes.join(', ')}`);
    linha();
  }

  titulo(rotulo(idioma, 'projetos'));
  for (const p of projetos(idioma)) {
    linha(`${p.nome} (${p.ano}${p.fim ? '' : ` - ${rotulo(idioma, 'atual')}`})`);
    linha(t(p.texto.linha, idioma));
    for (const d of p.texto.decisoes) linha(`- ${t(d, idioma)}`);
    linha(`${rotulo(idioma, 'tecnologias')}: ${p.stackNomes.join(', ')}`);
    if (p.url) linha(p.url);
    linha();
  }

  titulo(rotulo(idioma, 'competencias'));
  for (const g of competencias(idioma, ref).filter((x) => x.itens.length)) {
    const itens = g.itens.map((x) => (x.desde ? `${x.nomeIdioma} (${rotulo(idioma, 'desde')} ${x.desde})` : x.nomeIdioma));
    linha(`${t(AREAS_TEXTO[g.area], idioma)}: ${itens.join(', ')}`);
  }
  linha();
  linha(`${rotulo(idioma, 'comoTrabalho')}: ${t(COMO_TRABALHO, idioma)}`);

  titulo(rotulo(idioma, 'formacao'));
  for (const f of formacao(idioma)) linha(`${f.titulo} | ${f.instituicao} | ${f.periodo}`);
  for (const i of idiomas(idioma)) linha(`${i.nome}: ${i.nivel}`);

  return `${L.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function llmsTxt() {
  return `# Bruno Galiz

> ${t(RESUMO, 'pt')}

Desenvolvedor Full Stack Pleno em Campo Grande, MS, Brasil, trabalhando remoto. Java, Spring Boot, Vue.js, React, TypeScript e Node.js. Aberto a vagas remotas. Contato: ${PERFIL.contato.email}.

## Currículo

- [Currículo em texto puro (português)](${SITE}/cv.txt): experiência, projetos, competências e formação, em uma coluna
- [Résumé in plain text (English)](${SITE}/en/cv.txt): same content in English
- [JSON Resume (português)](${SITE}/curriculo.json): formato aberto jsonresume.org
- [JSON Resume (English)](${SITE}/resume.json): open jsonresume.org format
- [Currículo em PDF](${SITE}/curriculo/bruno-galiz-pt.pdf): versão para ATS, sem foto

## Páginas

- [Início](${SITE}/): currículo completo com a trajetória em modo história
- [Projetos pessoais](${SITE}/projetos/): ${new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(projetos('pt').map((p) => p.nome))}
- [English version](${SITE}/en/)

## Perfis

- [GitHub](${PERFIL.contato.github})
- [LinkedIn](${PERFIL.contato.linkedin})
`;
}
