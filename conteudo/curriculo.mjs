/**
 * TODO O TEXTO DO SITE, EM PT E EN LADO A LADO
 * ══════════════════════════════════════════════════════════════════════════
 * Estrutura e datas moram em assets/dados/perfil.js; aqui mora só a prosa.
 * O build (ferramentas/construir.mjs) junta os dois e gera as páginas PT e
 * EN, o JSON-LD, o JSON Resume, o cv.txt, o llms.txt e os PDFs. Editar uma
 * frase aqui muda todas as saídas de uma vez.
 *
 * Regras de escrita (DESIGN.md, seção Voz):
 *   · primeira pessoa, frases curtas, substantivo concreto;
 *   · nenhum travessão (— ou –): ponto, vírgula, dois-pontos ou parênteses;
 *   · nenhum número que o Bruno não saiba explicar numa entrevista;
 *   · o vocabulário das vagas (APIs REST, migração de legado, CI/CD...) só
 *     onde é verdade;
 *   · a principal entrega de cada cargo foi definida pelo Bruno (out/2026).
 *
 * `REVISAR` marca o que ainda depende de confirmação dele.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const PESSOA = {
  cargo: { pt: 'Desenvolvedor Full Stack Pleno', en: 'Mid-level Full Stack Developer' },
  cargoCurto: { pt: 'Desenvolvedor Full Stack', en: 'Full Stack Developer' },
  stackChave: 'Java, Spring Boot, Vue.js, React, TypeScript, Node.js',
  local: { pt: 'Campo Grande, MS. Remoto.', en: 'Campo Grande, Brazil. Remote.' },
  // REVISAR: texto de disponibilidade e regime (CLT, PJ ou os dois).
  disponibilidade: {
    pt: 'Aberto a vagas full stack remotas, CLT ou PJ',
    en: 'Open to remote full stack roles',
  },
};

export const RESUMO = {
  pt: 'Desenvolvedor full stack desde 2019. Hoje mantenho com Vue.js, Java e Spring Boot o sistema de frota do Governo do Tocantins. Antes, migrei o prontuário da Conexa Saúde de JSP para React e publiquei o Cartão de Vacinação de Mato Grosso do Sul nas lojas durante a Covid.',
  en: 'Full stack developer since 2019. Today I maintain the State of Tocantins fleet system with Vue.js, Java and Spring Boot. Before that, I migrated Conexa Saúde\'s medical record from JSP to React and shipped Mato Grosso do Sul\'s Covid Vaccination Card to both app stores.',
};

/* ══════════════════════════════════════════════════════════════════════════
   CARGOS. A chave casa com o `id` de EXPERIENCIAS em perfil.js.
   `principal` é o título do capítulo, o 1º tópico do cargo e o highlights[0]
   do JSON Resume. `apoio` são os tópicos seguintes, sempre começando por
   verbo. `caso` vira o "O caso completo" (<details>), e é opcional.
   `levei` é a linha humana "Levei daqui:", escrita pelo Bruno (vazio = some).
   ══════════════════════════════════════════════════════════════════════════ */

export const CARGOS = {
  az: {
    cargo: { pt: 'Desenvolvedor Full Stack', en: 'Full Stack Developer' },
    contexto: {
      pt: 'Sistema de Controle Veicular do Governo do Tocantins.',
      en: 'Vehicle Control System for the State of Tocantins.',
    },
    // REVISAR: confirmar que esta é a principal entrega da AZ.
    principal: {
      pt: 'Relatórios em PDF e Excel que respeitam as colunas e o filtro escolhidos na tela.',
      en: 'PDF and Excel reports that follow the columns and the filter chosen on screen.',
    },
    apoio: [
      { pt: 'Tornei dinâmicas as colunas da tabela da frota: o usuário escolhe quais aparecem, e o relatório sai com exatamente essas.',
        en: 'Made the fleet table columns dynamic: users pick which ones show, and the report comes out with exactly those.' },
      { pt: 'Crio e mantenho APIs REST em Java 11 e Spring Boot, com consultas em JPAQuery sobre PostgreSQL e OracleDB.',
        en: 'Build and maintain REST APIs in Java 11 and Spring Boot, with JPAQuery queries over PostgreSQL and OracleDB.' },
      { pt: 'Refiz itens de menu e o layout responsivo do front em Vue.js com TypeScript.',
        en: 'Reworked menu items and the responsive layout of the Vue.js and TypeScript front end.' },
    ],
    caso: {
      problema: {
        pt: 'A tabela da frota tem dezenas de colunas, e cada setor precisa de um recorte diferente para prestação de contas. O relatório era fixo: saía sempre igual, independente do que o usuário estivesse vendo na tela.',
        en: 'The fleet table has dozens of columns, and every department needs a different cut of it for public accountability. The report was fixed: it always came out the same, whatever the user was looking at.',
      },
      decisao: {
        pt: 'Tornei as colunas dinâmicas e fiz o filtro ativo seguir junto para a exportação. O que está na tela é o que cai no PDF ou na planilha.',
        en: 'I made the columns dynamic and carried the active filter into the export. What is on screen is what lands in the PDF or the spreadsheet.',
      },
      // REVISAR: resultado deduzido; confirmar com o Bruno.
      resultado: {
        pt: 'Cada setor tira o próprio recorte sem pedir um relatório novo para o time.',
        en: 'Each department pulls its own cut without asking the team for a new report.',
      },
    },
    levei: { pt: '', en: '' },
  },

  easy: {
    cargo: { pt: 'Desenvolvedor Front-end (freelancer)', en: 'Front-end Developer (freelance)' },
    contexto: { pt: 'Plataforma de busca de imóveis.', en: 'Property search platform.' },
    principal: {
      pt: 'Otimização de desempenho da página de busca de imóveis.',
      en: 'Performance optimization of the property search page.',
    },
    apoio: [
      { pt: 'Construí filtros personalizados, mapas interativos e fluxos de formulário com componentes reutilizáveis em Nuxt e Vue.js.',
        en: 'Built custom filters, interactive maps and form flows with reusable components in Nuxt and Vue.js.' },
    ],
    levei: { pt: '', en: '' },
  },

  conexa: {
    cargo: { pt: 'Desenvolvedor Front-end', en: 'Front-end Developer' },
    contexto: { pt: 'Plataforma de telemedicina.', en: 'Telemedicine platform.' },
    principal: {
      pt: 'Modularização do prontuário eletrônico e migração de JSP para React.',
      en: 'Modularization of the electronic medical record and migration from JSP to React.',
    },
    apoio: [
      { pt: 'Migrei módulos do prontuário de JSP legado para React com Hooks e TypeScript, sem tirar do ar o que já funcionava.',
        en: 'Migrated medical record modules from legacy JSP to React with Hooks and TypeScript, without taking down what was already live.' },
      { pt: 'Transformei os formulários em módulos configuráveis: cada clínica cria os campos de que precisa, sem deploy.',
        en: 'Turned the forms into configurable modules: each clinic creates the fields it needs, with no deploy.' },
      { pt: 'Mantive os módulos de regras de negócio em Vue.js, num time Scrum.',
        en: 'Maintained the business-rule modules in Vue.js, on a Scrum team.' },
    ],
    caso: {
      problema: {
        pt: 'O prontuário rodava em JSP legado, e cada clínica precisava de campos diferentes. Cada campo novo virava chamado, deploy e espera. O time de produto era gargalo de uma coisa que, no fundo, era configuração.',
        en: 'The record ran on legacy JSP, and every clinic needed different fields. Each new field meant a ticket, a deploy and a wait. The product team was the bottleneck for something that was really just configuration.',
      },
      decisao: {
        pt: 'Migrei os módulos para React aos poucos, convivendo com o JSP, e modularizei os formulários para que o campo virasse dado, não código.',
        en: 'I migrated the modules to React step by step, living alongside the JSP, and modularized the forms so a field became data, not code.',
      },
      resultado: {
        pt: 'A própria clínica cria os campos de que precisa, sem deploy no meio.',
        en: 'The clinic itself creates the fields it needs, with no deploy in between.',
      },
    },
    levei: { pt: '', en: '' },
  },

  calango: {
    cargo: { pt: 'Desenvolvedor Front-end (freelancer)', en: 'Front-end Developer (freelance)' },
    contexto: { pt: 'Coleção de NFTs.', en: 'NFT collection.' },
    principal: {
      pt: 'Conexão do front-end React com carteiras digitais Web3 (MetaMask) para ler os NFTs de cada usuário.',
      en: 'Connected the React front end to Web3 digital wallets (MetaMask) to read each user\'s NFTs.',
    },
    apoio: [
      { pt: 'Montei um jogo da memória no navegador com os tokens da carteira conectada.',
        en: 'Built a browser memory game from the tokens in the connected wallet.' },
      { pt: 'Publiquei a landing page da coleção em Next.js, na Vercel.',
        en: 'Shipped the collection landing page in Next.js, on Vercel.' },
    ],
    levei: { pt: '', en: '' },
  },

  sgi: {
    cargo: { pt: 'Desenvolvedor Full Stack', en: 'Full Stack Developer' },
    contexto: {
      pt: 'Superintendência de Gestão da Informação (SGI) do Governo de Mato Grosso do Sul.',
      en: 'Information Management Office (SGI), State of Mato Grosso do Sul.',
    },
    principal: {
      pt: 'Cartão de Vacinação digital durante a pandemia de Covid, publicado na App Store e na Google Play.',
      en: 'Digital Vaccination Card during the Covid pandemic, shipped to the App Store and Google Play.',
    },
    apoio: [
      { pt: 'Participei também do Cartão SUS e do Passe Livre, em Ionic com Angular.',
        en: 'Also worked on the SUS Card and the Free Pass apps, in Ionic with Angular.' },
      { pt: 'Preparei os builds no Android Studio e no Xcode e fiz as publicações nas lojas.',
        en: 'Prepared the builds in Android Studio and Xcode and handled the store releases.' },
      { pt: 'Trabalhei no portal MS Digital e em APIs REST em Node.js com Sequelize e SQL Server.',
        en: 'Worked on the MS Digital portal and on REST APIs in Node.js with Sequelize and SQL Server.' },
    ],
    levei: { pt: '', en: '' },
  },

  reduza: {
    cargo: { pt: 'Desenvolvedor Full Stack', en: 'Full Stack Developer' },
    contexto: { pt: 'Plataforma de cupons e comparação de preços.', en: 'Coupon and price-comparison platform.' },
    principal: {
      pt: 'Crawlers de preço em Node.js e uma página web por loja, otimizada para SEO.',
      en: 'Price crawlers in Node.js and one web page per store, optimized for SEO.',
    },
    apoio: [
      { pt: 'Escrevi robôs de coleta com ciclos de atualização automáticos, com dados em MongoDB e Redis.',
        en: 'Wrote scraping bots with automatic refresh cycles, with data in MongoDB and Redis.' },
      { pt: 'Construí a comparação de preço entre lojas em tempo real, com front em Angular.',
        en: 'Built real-time price comparison across stores, with an Angular front end.' },
    ],
    levei: { pt: '', en: '' },
  },

  unisys: {
    cargo: { pt: 'Service Desk de TI', en: 'IT Service Desk' },
    contexto: { pt: '', en: '' },
    principal: {
      pt: 'Suporte remoto, gestão de acessos no Active Directory e configuração de rede, antes de programar profissionalmente.',
      en: 'Remote support, Active Directory access management and network setup, before programming professionally.',
    },
    apoio: [],
    levei: { pt: '', en: '' },
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   PROJETOS. A chave casa com o `id` de PROJETOS em perfil.js.
   ══════════════════════════════════════════════════════════════════════════ */

export const PROJETOS_TEXTO = {
  copiloto: {
    linha: {
      pt: 'Sistema de apoio à decisão para operar no MetaTrader 5, em modo observação: analisa o gráfico, calcula o risco e explica, mas nunca envia ordem.',
      en: 'Decision-support system for trading on MetaTrader 5, in observation mode: it reads the chart, sizes the risk and explains, but never places an order.',
    },
    porque: {
      pt: 'Nasceu de um pedido por "98% de precisão". A primeira coisa que ele faz é explicar por que esse número não existe e o que medir no lugar dele.',
      en: 'It started from a request for "98% accuracy". The first thing it does is explain why that number does not exist, and what to measure instead.',
    },
    decisoes: [
      { pt: 'Nunca mostra percentual de confiança: mostra "3 de 4 critérios alinhados", verificável item a item no gráfico.',
        en: 'Never shows a confidence percentage: it shows "3 of 4 criteria aligned", checkable item by item on the chart.' },
      { pt: 'Registra cada operação num diário, para medir se existe vantagem de verdade.',
        en: 'Logs every trade in a journal, to measure whether there is a real edge.' },
      { pt: 'Tem 743 testes automatizados; o executor autônomo roda só em conta demo, com revisão semanal.',
        en: 'Has 743 automated tests; the autonomous executor runs on a demo account only, reviewed weekly.' },
    ],
    estado: { pt: 'Em uso, em conta demo', en: 'In use, on a demo account' },
  },

  assetforge: {
    linha: {
      pt: 'Gerador de assets de jogo prontos para a Unity: de uma descrição em texto (ou de uma imagem) até FBX Humanoid com texturas, prefab e animações.',
      en: 'Game asset generator ready for Unity: from a text description (or an image) to a Humanoid FBX with textures, prefab and animations.',
    },
    // REVISAR: motivação deduzida do README ("custo R$ 0", "nunca cadastre cartão").
    porque: {
      pt: 'Criar personagem 3D para um jogo pequeno custa caro e exige ferramentas pagas. A ideia é chegar ao mesmo resultado só com ferramentas livres e cotas gratuitas.',
      en: 'Making 3D characters for a small game is expensive and needs paid tools. The goal is to reach the same result with free tools and free quotas only.',
    },
    decisoes: [
      { pt: 'Clean Architecture em Python, com um roteador de provedores de IA que troca de serviço quando a cota gratuita acaba.',
        en: 'Clean Architecture in Python, with an AI provider router that switches services when a free quota runs out.' },
      { pt: 'Blender sem interface e MakeHuman geram personagens já com esqueleto, mais uma biblioteca de 45 animações livres.',
        en: 'Headless Blender and MakeHuman generate fully rigged characters, plus a library of 45 free animations.' },
      { pt: 'Um pacote Unity importa tudo sozinho: Avatar Humanoid, materiais URP, prefab e Animator de locomoção. 73 testes.',
        en: 'A Unity package imports everything on its own: Humanoid Avatar, URP materials, prefab and a locomotion Animator. 73 tests.' },
    ],
    estado: { pt: 'Em desenvolvimento', en: 'In development' },
  },

  eplay: {
    linha: {
      pt: 'Aplicativo da comunidade E-PLAY: agendar partidas, pontuar num ranking, ler a Bíblia em grupo e acompanhar as lives.',
      en: 'App for the E-PLAY community: schedule matches, score on a leaderboard, read the Bible as a group and follow the live streams.',
    },
    // REVISAR: por que o projeto existe, nas palavras do Bruno. Vazio = não aparece.
    porque: { pt: '', en: '' },
    decisoes: [
      { pt: 'React com Capacitor gera o APK Android a partir do mesmo código web, com build pelo GitHub Actions.',
        en: 'React with Capacitor builds the Android APK from the same web code, with builds on GitHub Actions.' },
      { pt: 'Supabase no back-end: login Google, aceite de LGPD e perfil público com controle de privacidade.',
        en: 'Supabase on the back end: Google sign-in, LGPD consent and a public profile with privacy controls.' },
      { pt: 'Moderação automática por regras (bloqueia, adverte, bane), Bíblia offline com busca e modo daltônico com 4 opções.',
        en: 'Rule-based automatic moderation (block, warn, ban), an offline Bible with search, and a color-blind mode with 4 options.' },
    ],
    estado: { pt: 'APK Android', en: 'Android APK' },
  },

  cronometro: {
    linha: {
      pt: 'Controle do tempo de fala de oradores em reuniões e eventos, com alertas visuais e sonoros, registro de participantes e exportação em PDF.',
      en: 'Speaking-time control for speakers at meetings and events, with visual and audio alerts, a speaker log and PDF export.',
    },
    // REVISAR: por que o projeto existe, nas palavras do Bruno. Vazio = não aparece.
    porque: { pt: '', en: '' },
    decisoes: [
      { pt: 'Lógica do cronômetro e do sino em hooks próprios, separada da tela.',
        en: 'Timer and bell logic in dedicated hooks, kept apart from the UI.' },
      { pt: 'QR code na tela e exportação do registro dos oradores em PDF.',
        en: 'On-screen QR code and PDF export of the speaker log.' },
    ],
    estado: { pt: 'No ar', en: 'Live' },
  },

  minin8n: {
    linha: {
      pt: 'Editor visual de fluxos de automação, no estilo do n8n, que dispara mensagens por um bot do Telegram.',
      en: 'Visual automation-flow editor, in the style of n8n, that sends messages through a Telegram bot.',
    },
    // REVISAR: por que o projeto existe, nas palavras do Bruno. Vazio = não aparece.
    porque: { pt: '', en: '' },
    decisoes: [
      { pt: 'Front em React com React Flow: o fluxo é montado arrastando nós.',
        en: 'React front end with React Flow: the flow is built by dragging nodes.' },
      { pt: 'API REST em Node.js e Express que conversa com a API do Telegram, com intervalo configurável entre envios para evitar bloqueio.',
        en: 'REST API in Node.js and Express that talks to the Telegram API, with a configurable delay between sends to avoid being blocked.' },
    ],
    estado: { pt: 'Código aberto', en: 'Open source' },
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   COMPETÊNCIAS E FORMA DE TRABALHO
   ══════════════════════════════════════════════════════════════════════════ */

export const AREAS_TEXTO = {
  front:   { pt: 'Front-end',              en: 'Front end' },
  back:    { pt: 'Back-end e APIs',        en: 'Back end and APIs' },
  dados:   { pt: 'Bancos de dados',        en: 'Databases' },
  entrega: { pt: 'Entrega e operação',     en: 'Delivery and operations' },
  mobile:  { pt: 'Mobile e jogos',         en: 'Mobile and games' },
  ia:      { pt: 'IA no desenvolvimento',  en: 'AI in development' },
  metodo:  { pt: 'Métodos',                en: 'Methods' },
};

export const COMO_TRABALHO = {
  pt: 'Uso IA no dia a dia para explorar código, refatorar e revisar, sempre com teste e revisão humana antes de ir para produção. Nos projetos pessoais isso fica documentado: o Copiloto de Trading tem 743 testes automatizados e o AssetForge, 73.',
  en: 'I use AI every day to explore code, refactor and review, always with tests and human review before anything reaches production. My personal projects document it: the Trading Copilot has 743 automated tests and AssetForge has 73.',
};

export const FORMACAO_TEXTO = {
  ucdb: {
    titulo: { pt: 'Bacharelado em Engenharia da Computação', en: 'B.Sc. in Computer Engineering' },
    detalhe: {
      pt: 'Estruturas de dados, redes, sistemas operacionais, bancos de dados, engenharia de software e compiladores.',
      en: 'Data structures, networking, operating systems, databases, software engineering and compilers.',
    },
  },
  hightech: {
    titulo: { pt: 'Curso de Desenvolvimento de Software', en: 'Software Development Course' },
    detalhe: { pt: 'Vue.js, Node.js e MongoDB.', en: 'Vue.js, Node.js and MongoDB.' },
  },
};

export const IDIOMAS_TEXTO = {
  pt: { nome: { pt: 'Português', en: 'Portuguese' }, nivel: { pt: 'nativo', en: 'native' } },
  en: { nome: { pt: 'Inglês', en: 'English' }, nivel: { pt: 'avançado', en: 'advanced' } },
};

export const CONTATO = {
  titulo: { pt: 'Contato', en: 'Contact' },
  texto: {
    pt: 'O caminho mais rápido é e-mail. LinkedIn e WhatsApp também funcionam. Pode mandar a descrição da vaga direto.',
    en: 'E-mail is the fastest way to reach me. LinkedIn and WhatsApp work too. Feel free to send the job description straight away.',
  },
  whatsappMensagem: {
    pt: 'Olá Bruno, vi seu portfólio e queria falar sobre uma vaga.',
    en: 'Hi Bruno, I saw your portfolio and would like to talk about a role.',
  },
  emailAssunto: { pt: 'Vaga de desenvolvedor full stack', en: 'Full stack developer role' },
};

export const COLOFAO = {
  pt: 'Feito em HTML, CSS e JavaScript, sem framework. Datas calculadas, nunca digitadas. Visitas contadas sem cookies.',
  en: 'Built with HTML, CSS and JavaScript, no framework. Dates are computed, never typed. Visits are counted without cookies.',
};

/* ══════════════════════════════════════════════════════════════════════════
   RÓTULOS DA INTERFACE
   Títulos de seção seguem o padrão de currículo de propósito: é o que ATS e
   leitores por IA reconhecem como campo ("Experiência profissional",
   "Competências técnicas"), e é o que a Gaia, da Gupy, mais pesa.
   ══════════════════════════════════════════════════════════════════════════ */

export const ROTULOS = {
  pt: {
    pular: 'Pular para o conteúdo',
    navExperiencia: 'Experiência',
    navProjetos: 'Projetos',
    navCurriculo: 'Currículo',
    outroIdioma: 'English',
    outroIdiomaRotulo: 'Read in English',
    temaClaro: 'Mudar para tema claro',
    temaEscuro: 'Mudar para tema escuro',
    baixarCurriculo: 'Baixar currículo',
    resumo: 'Resumo profissional',
    experiencia: 'Experiência profissional',
    atual: 'atual',
    tecnologias: 'Tecnologias',
    casoCompleto: 'O caso completo',
    problema: 'Problema',
    decisao: 'Decisão',
    resultado: 'Resultado',
    levei: 'Levei daqui',
    paralelo: 'em paralelo',
    remoto: 'remoto',
    campoGrande: 'Campo Grande, MS',
    relatorio: 'Monte o relatório de mim',
    relatorioTexto: 'Escolha as colunas e o filtro. O PDF sai igual à tela, que é exatamente o que eu faço no trabalho.',
    colunas: 'Colunas',
    filtroTecnologia: 'Tecnologia',
    filtroDominio: 'Área',
    todas: 'todas',
    todos: 'todos',
    gerarPdf: 'Gerar PDF',
    copiarTexto: 'Copiar como texto',
    copiado: 'Copiado',
    colEmpresa: 'Empresa',
    colPeriodo: 'Período',
    colCargo: 'Cargo',
    colEntrega: 'Principal entrega',
    colDominio: 'Área',
    colStack: 'Tecnologias',
    projetos: 'Projetos pessoais',
    projetosTexto: 'O que eu construo fora do trabalho, para aprender e para usar.',
    verProjetos: 'Ver todos os projetos',
    codigoSobPedido: 'Código sob pedido',
    verCodigo: 'Ver código',
    abrir: 'Abrir',
    porQue: 'Por que existe',
    oQueFaz: 'O que faz',
    decisoes: 'Decisões técnicas',
    estado: 'Estado',
    competencias: 'Competências técnicas',
    desde: 'desde',
    emUso: 'em uso',
    emProjetos: 'em projetos',
    comoTrabalho: 'Como eu trabalho',
    formacao: 'Formação e idiomas',
    contato: 'Contato',
    copiarEmail: 'Copiar e-mail',
    curriculoPt: 'Currículo em PDF (português)',
    curriculoEn: 'Currículo em PDF (inglês)',
    atualizado: 'Atualizado em',
    privacidade: 'Privacidade',
    curriculoTitulo: 'Currículo',
    curriculoIntro: 'Versão em uma coluna, para ler, copiar ou imprimir.',
    imprimir: 'Imprimir',
    baixarPdf: 'Baixar PDF',
    voltar: 'Voltar ao início',
    naoEncontrada: 'Página não encontrada',
    naoEncontradaTexto: 'Este endereço não existe, ou mudou de lugar quando o site foi renovado.',
  },
  en: {
    pular: 'Skip to content',
    navExperiencia: 'Experience',
    navProjetos: 'Projects',
    navCurriculo: 'Résumé',
    outroIdioma: 'Português',
    outroIdiomaRotulo: 'Ler em português',
    temaClaro: 'Switch to light theme',
    temaEscuro: 'Switch to dark theme',
    baixarCurriculo: 'Download résumé',
    resumo: 'Professional summary',
    experiencia: 'Professional experience',
    atual: 'present',
    tecnologias: 'Technologies',
    casoCompleto: 'The full case',
    problema: 'Problem',
    decisao: 'Decision',
    resultado: 'Result',
    levei: 'What I took from it',
    paralelo: 'in parallel',
    remoto: 'remote',
    campoGrande: 'Campo Grande, Brazil',
    relatorio: 'Build a report on me',
    relatorioTexto: 'Pick the columns and the filter. The PDF comes out exactly as the screen, which is what I build at work.',
    colunas: 'Columns',
    filtroTecnologia: 'Technology',
    filtroDominio: 'Field',
    todas: 'all',
    todos: 'all',
    gerarPdf: 'Generate PDF',
    copiarTexto: 'Copy as text',
    copiado: 'Copied',
    colEmpresa: 'Company',
    colPeriodo: 'Period',
    colCargo: 'Role',
    colEntrega: 'Main delivery',
    colDominio: 'Field',
    colStack: 'Technologies',
    projetos: 'Personal projects',
    projetosTexto: 'What I build outside work, to learn and to use.',
    verProjetos: 'See all projects',
    codigoSobPedido: 'Code on request',
    verCodigo: 'View code',
    abrir: 'Open',
    porQue: 'Why it exists',
    oQueFaz: 'What it does',
    decisoes: 'Technical decisions',
    estado: 'Status',
    competencias: 'Technical skills',
    desde: 'since',
    emUso: 'in use',
    emProjetos: 'in projects',
    comoTrabalho: 'How I work',
    formacao: 'Education and languages',
    contato: 'Contact',
    copiarEmail: 'Copy e-mail',
    curriculoPt: 'Résumé PDF (Portuguese)',
    curriculoEn: 'Résumé PDF (English)',
    atualizado: 'Updated',
    privacidade: 'Privacy',
    curriculoTitulo: 'Résumé',
    curriculoIntro: 'Single-column version, to read, copy or print.',
    imprimir: 'Print',
    baixarPdf: 'Download PDF',
    voltar: 'Back to home',
    naoEncontrada: 'Page not found',
    naoEncontradaTexto: 'This address does not exist, or it moved when the site was rebuilt.',
  },
};
