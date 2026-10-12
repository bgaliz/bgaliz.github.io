/**
 * JSON-LD (schema.org)
 * ══════════════════════════════════════════════════════════════════════════
 * O que buscadores, sourcing por IA e leitores de LLM extraem sem precisar
 * interpretar o layout. Cada cargo vira um Role com datas e descrição (a
 * principal entrega), que é o padrão do próprio schema.org para trajetória:
 * `worksFor` envolvido em OrganizationRole para o atual, `alumniOf` para os
 * anteriores. A ocupação traz o código O*NET de Software Developers.
 *
 * O telefone fica fora de propósito: dado público estruturado é o primeiro
 * alvo de raspagem para spam. Ele continua no botão de WhatsApp e no PDF.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { SITE, ROTAS, LOCALE, t } from '../paginas/base.mjs';
import { cargos, projetos, competencias, formacao, PERFIL } from '../paginas/dados.mjs';
import { PESSOA, RESUMO } from '../../conteudo/curriculo.mjs';

export const ID_PESSOA = `${SITE}/#pessoa`;

export function pessoa(idioma, ref = new Date()) {
  const lista = cargos(idioma).filter((c) => c.contaComoDev);
  const atual = lista.find((c) => c.atual);
  const anteriores = lista.filter((c) => !c.atual);
  const skills = competencias(idioma, ref).flatMap((g) => g.itens)
    .sort((a, b) => Number(b.emUso) - Number(a.emUso))
    .map((x) => x.nomeIdioma);
  const ucdb = formacao(idioma).find((f) => f.id === 'ucdb');

  const papel = (c) => ({
    '@type': 'OrganizationRole',
    roleName: t(c.texto.cargo, idioma),
    startDate: c.inicio,
    ...(c.fim ? { endDate: c.fim } : {}),
    description: t(c.texto.principal, idioma),
  });

  return {
    '@type': 'Person',
    '@id': ID_PESSOA,
    name: PERFIL.nome,
    alternateName: PERFIL.nomeCompleto,
    givenName: 'Bruno',
    familyName: 'Galiz de Oliveira',
    jobTitle: t(PESSOA.cargo, idioma),
    description: t(RESUMO, idioma),
    url: `${SITE}${ROTAS[idioma].inicio}`,
    image: `${SITE}/assets/img/retrato/bruno-3x4-960.jpg`,
    email: `mailto:${PERFIL.contato.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: PERFIL.local.cidade,
      addressRegion: PERFIL.local.estado,
      addressCountry: PERFIL.local.pais,
    },
    sameAs: [PERFIL.contato.github, PERFIL.contato.linkedin],
    knowsLanguage: [
      { '@type': 'Language', name: 'Portuguese', alternateName: 'pt' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
    ],
    knowsAbout: skills,
    hasOccupation: {
      '@type': 'Occupation',
      name: t(PESSOA.cargoCurto, idioma),
      occupationalCategory: '15-1252.00',
      skills: skills.join(', '),
      occupationLocation: { '@type': 'Country', name: 'Brasil' },
    },
    ...(atual ? {
      worksFor: { ...papel(atual), worksFor: { '@type': 'Organization', name: atual.empresa } },
    } : {}),
    alumniOf: [
      ...anteriores.map((c) => ({ ...papel(c), alumniOf: { '@type': 'Organization', name: c.empresa } })),
      {
        '@type': 'OrganizationRole',
        startDate: ucdb.inicio,
        endDate: ucdb.fim,
        alumniOf: { '@type': 'CollegeOrUniversity', name: ucdb.instituicao },
      },
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: ucdb.titulo,
      recognizedBy: { '@type': 'CollegeOrUniversity', name: ucdb.instituicao },
    },
  };
}

/** ProfilePage + Person: o par que o Google documenta para página de perfil. */
export function jsonldPessoa(idioma, { pagina = 'inicio', ref = new Date() } = {}) {
  const url = `${SITE}${ROTAS[idioma][pagina] ?? ROTAS[idioma].inicio}`;
  return [
    {
      '@type': 'ProfilePage',
      '@id': `${url}#pagina`,
      url,
      inLanguage: LOCALE[idioma],
      dateModified: ref.toISOString().slice(0, 10),
      mainEntity: { '@id': ID_PESSOA },
    },
    pessoa(idioma, ref),
  ];
}

export function jsonldProjetos(idioma, ref = new Date()) {
  const url = `${SITE}${ROTAS[idioma].projetos}`;
  return [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#pagina`,
      url,
      inLanguage: LOCALE[idioma],
      dateModified: ref.toISOString().slice(0, 10),
      about: { '@id': ID_PESSOA },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: projetos(idioma).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: p.nome,
            description: t(p.texto.linha, idioma),
            applicationCategory: 'DeveloperApplication',
            keywords: p.stackNomes.join(', '),
            dateCreated: p.inicio,
            ...(p.url ? { url: p.url } : {}),
            author: { '@id': ID_PESSOA },
          },
        })),
      },
    },
    pessoa(idioma, ref),
  ];
}
