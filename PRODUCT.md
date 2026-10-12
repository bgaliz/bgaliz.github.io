# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Recrutadores e gestores técnicos de empresas brasileiras** com vagas full stack remotas. Chegam pelo LinkedIn, pelo link do currículo ou pelo WhatsApp, muitas vezes no celular, e decidem em segundos se vale continuar lendo.
- **Os sistemas desses recrutadores:** ATS (a Gaia, da Gupy, ordena candidatos pela aderência de *Experiência* e *Habilidades* aos termos da vaga), ferramentas de sourcing por IA que montam perfis a partir de sites pessoais e do GitHub (SeekOut, HireEZ, Findem, Eightfold, Covey) e scanners de link de e-mail/ATS que abrem o site num navegador headless, sem rolar.

## Product Purpose

Portfólio e currículo vivo de Bruno Galiz de Oliveira, desenvolvedor full stack desde 2019. Existe para que ele seja encontrado, bem lido e chamado para entrevista. Sucesso é: pessoas reais (não robôs) lendo além da primeira tela, abrindo os casos, baixando o currículo ou entrando em contato, e candidaturas que viram conversa.

## Positioning

Um currículo que não envelhece e que não se contradiz: todas as datas são calculadas, e páginas PT e EN, PDF, JSON-LD, JSON Resume e texto puro saem de uma fonte só. O caso de trabalho mais forte do Bruno (relatórios que respeitam as colunas e o filtro escolhidos na tela) é demonstrado no próprio site: o visitante monta "o relatório de mim" e o PDF sai igual à tela.

## Operating Context

- O link vai em candidaturas (Gupy, LinkedIn), no perfil do LinkedIn e do GitHub e em mensagens. Cada envio usa um `?ref=` para saber se foi aberto.
- O site é lido por gente e por máquina: tudo precisa estar no HTML, visível sem JS e sem rolar.
- Medição própria, sem cookies e sem IP gravado (LGPD), com painel privado.

## Capabilities and Constraints

- HTML, CSS e JavaScript sem framework, sem bundler; build em Node sem dependências de runtime. Hospedagem no GitHub Pages (`bgaliz.github.io`, a URL que está nos currículos); API de visitas e painel na Vercel com Neon Postgres.
- Datas nunca escritas à mão (`assets/dados/perfil.js` + slots `data-din`), contagem de meses inclusiva como no LinkedIn, tempo de carreira como união de intervalos.
- Título: **Desenvolvedor Full Stack Pleno**. Alvo: vagas full stack remotas no Brasil.
- Há uma lacuna real de 10 meses (out/2024 a jul/2025): aparece na linha do tempo, sem texto.
- Microsserviços, Kubernetes e nuvem: o Bruno tem experiência, ainda sem cargo atribuído; aparecem sem ano.

## Brand Commitments

- Não pode parecer gerado por IA (rejeitado explicitamente), mas também não pode ser austero ou simples demais.
- Voz: primeira pessoa, frases curtas, fatos concretos, nenhum travessão, nenhum número que o Bruno não saiba explicar.
- A principal entrega de cada cargo foi definida pelo Bruno e abre cada capítulo da experiência.

## Evidence on Hand

- Foto real do Bruno (400×400, fundo de tijolo): `assets/img/origem/bruno.jpg`.
- Prévias de link montadas dos metadados reais de cada site (`dados/previas.json`); nenhum print feito à mão.
- Projetos pessoais reais: Copiloto de Trading (743 testes), AssetForge (73 testes), E-PLAY, Cronômetro de Oradores, Mini n8n.
- Dados de visitas e linha de base: `docs/linha-de-base-2026-10.md`. Termos das vagas: `docs/termos-vagas.md`.
- **Não existem e não podem ser inventados:** depoimentos, logos de clientes, métricas de impacto não confirmadas, prints de sistemas privados (AZ, Conexa).

## Product Principles

1. Dois leitores, uma página: o que a pessoa vê e o que a máquina lê dizem a mesma coisa.
2. Provar em vez de afirmar: demonstrar o caso (relatório, campo sem deploy) em vez de adjetivar.
3. Nada nasce invisível: animação desloca, nunca esconde.
4. Uma fonte, todas as saídas: nenhuma versão do currículo pode divergir de outra.
5. Medir com honestidade: robô, scanner e o próprio dono ficam fora da contagem de pessoas.

## Accessibility & Inclusion

WCAG 2.2 AA: contraste verificado nos dois temas, navegação completa por teclado, foco sempre visível, `prefers-reduced-motion` respeitado, conteúdo completo sem JavaScript.
