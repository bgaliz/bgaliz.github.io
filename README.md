# Portfólio e currículo vivo: Bruno Galiz

HTML, CSS e JavaScript sem framework. As páginas são geradas por um build em Node sem
dependência de runtime, e o resultado é estático: abrir `index.html` num servidor já funciona.

```bash
npm ci               # Playwright (só para PDF, prévias e testes)
npm run construir    # gera as páginas PT e EN e todas as saídas para máquina
npm run pdf          # gera os PDFs do currículo a partir de /curriculo/
npm run robo         # o site visto pelo robô do recrutador (falha se algo sumir)
npm run verificar    # camada temporal (32 testes)
npm run previas      # recoleta as prévias de link dos sites dos projetos
npm run tudo         # verificar + construir + pdf + robo
npm run servir       # http://localhost:8000
```

---

## Para quem este site existe

Dois leitores ao mesmo tempo:

1. **O recrutador**, que decide em segundos e chega pelo LinkedIn, muitas vezes no celular.
2. **O robô do recrutador**: ATS (a Gaia, da Gupy, ordena por aderência de *Experiência* e
   *Habilidades* aos termos da vaga), sourcing por IA que monta perfis a partir de sites
   pessoais e do GitHub, e scanners de link que abrem o site num navegador headless.

Em 12/out/2026, num headless que não rolava a página, 81% do texto da versão antiga ficava
invisível (revelação por opacidade). A regra desde então: **nada nasce invisível**, e
`npm run robo` verifica isso em todas as páginas a cada publicação.

---

## Uma fonte, todas as saídas

```
assets/dados/perfil.js        estrutura, datas, stack por cargo e por projeto
conteudo/curriculo.mjs        todo o texto, PT e EN lado a lado
dados/previas.json            prévias de link (metadados dos sites, como o WhatsApp)
        ↓  ferramentas/construir.mjs
/ · /projetos/ · /curriculo/            páginas em português
/en/ · /en/projects/ · /en/resume/      páginas em inglês (hreflang)
JSON-LD em cada página                  ProfilePage + Person + cargos + projetos
/curriculo.json · /resume.json          JSON Resume
/cv.txt · /en/cv.txt                    currículo em texto puro
/llms.txt                               índice para leitores por IA
/curriculo/bruno-galiz-{pt,en}.pdf      impressão de /curriculo/ (gerar-pdf.mjs)
sitemap.xml                             com as versões de idioma
```

O problema original deste projeto eram três currículos (PT, EN e LinkedIn) que se
contradiziam. Agora a página, o PDF, o JSON e o texto puro saem da mesma fonte e não têm
como divergir. **Para mudar um texto, edite `conteudo/curriculo.mjs` e rode
`npm run construir`.** Nunca edite os HTML gerados à mão.

### Prévias de link, sem prints

Projetos e empresas aparecem como a prévia que o WhatsApp mostra ao colar uma URL:
`coletar-previas.mjs` abre cada site no build, lê `og:title`, `og:description`, `og:image`
e o ícone, e redesenha a imagem como WebP no próprio portfólio. Sem `og:image`, usa uma
captura da página; sem URL pública, a prévia sai só com texto. Se um site cair, fica a
última prévia boa.

### O retrato

Foto real (o original fica em `assets/img/origem/`, fora do site), ampliada com o
Higgsfield e conferida lado a lado com o original. `gerar-retrato.mjs` gera o 3x4, a
miniatura da barra e a retícula usada no PDF do "Monte o relatório de mim".

---

## Como os dados temporais funcionam

**Nenhum número temporal é escrito à mão.** Datas vivem em `perfil.js`; `tempo.js` calcula;
os slots `data-din` levam o valor ao HTML no build e `dinamico.js` recalcula no navegador
entre um build e outro. A Action `atualizar.yml` roda todo dia 1º (e a cada mudança de
conteúdo na master): recalcula, recoleta prévias, gera páginas e PDFs, roda o teste do
robô e só então commita.

Três detalhes que não são óbvios:

1. **Contagem inclusiva.** `meses = (anoF×12 + mesF) − (anoI×12 + mesI) + 1`, como o
   LinkedIn. `npm run verificar` valida contra os cargos encerrados.
2. **União de intervalos, não soma.** O freelance na Calango Doido corre em paralelo a SGI e
   Conexa: a união conta os meses reais.
3. **`fim: null` significa "em curso".** O rótulo "atual" e a duração que cresce são
   derivados.

### Competências: "desde AAAA" e "em uso"

Derivados das datas dos cargos e projetos que citam cada tecnologia (`competencias.js`):
é o mesmo cálculo que os robôs de recrutador fazem. Tecnologia que o Bruno confirmou ter,
mas ainda sem cargo atribuído (`semData: true`), aparece sem ano.

---

## Onde mora o quê

```
conteudo/curriculo.mjs     TODO o texto, PT e EN
assets/dados/perfil.js     estrutura e datas (fonte única)
ferramentas/paginas/       templates (home, projetos, currículo, 404, privacidade)
ferramentas/saidas/        JSON-LD, JSON Resume, texto puro, llms.txt
ferramentas/*.mjs          construir, gerar-pdf, gerar-og, gerar-retrato,
                           coletar-previas, verificar-robo, verificar-tempo
assets/css/                tokens, base, layout, componentes, movimento, impressão
assets/css/painel/         estilos próprios do painel de visitas
assets/js/                 comportamento (carregado só na página que usa)
api/                       funções da Vercel: coletar, painel, entrar, sair, limpar
DESIGN.md                  sistema visual "Relatório vivo"
PRODUCT.md                 para quem é, o que precisa provar, princípios
docs/                      linha de base de visitas e termos das vagas
```

## Deploy

### 1. Site — GitHub Pages

Repositório `bgaliz.github.io`, branch principal. Nada mais. A URL é a que já está nos três
currículos.

### 2. API e painel — Vercel *(opcional)*

O portfólio funciona 100% sem isto. Enquanto `API_BASE` for `null` em `assets/js/config.js`, o
rastreamento fica desligado e o aviso de privacidade não aparece.

```bash
npm i -g vercel
vercel link                     # importa o mesmo repositório
```

1. No painel da Vercel: **Storage → Marketplace → Neon** (plano gratuito).
   Isso define `DATABASE_URL` sozinho.
2. Adicione as variáveis de ambiente:
   - `PAINEL_TOKEN`: a senha do painel, escolhida por você
   - `SAL_VISITANTE`: qualquer string longa e aleatória (obrigatória em produção:
     sem ela nada é gravado)
   - `PAINEL_SEGREDO` *(recomendada)*: string longa e aleatória que assina o cookie
     de sessão do painel. Sem ela, a chave deriva do `PAINEL_TOKEN`.
3. Em `assets/js/config.js`, troque:
   ```js
   export const API_BASE = 'https://SEU-PROJETO.vercel.app/api';
   ```
4. Commite e faça o deploy. A tabela é criada sozinha na primeira visita.

> O plano Hobby da Vercel é para uso pessoal e não comercial — um portfólio se enquadra.

---

### Painel

Abre em **`https://bgaliz-portfolio.vercel.app/painel`**, no mesmo domínio da API. O token
é enviado uma vez para `/api/entrar`, que devolve um cookie `HttpOnly; Secure;
SameSite=Strict` de 12 horas: nenhum script da página enxerga a sessão, e nada fica no
`localStorage`. Dez tentativas erradas no mesmo dia bloqueiam o IP até o dia virar. Para
scripts, `curl -H "Authorization: Bearer $PAINEL_TOKEN" .../api/painel` continua valendo.

O resto do site na Vercel redireciona (308) para o GitHub Pages: existe uma cópia pública
só, e é a que está nos currículos.

**Suas próprias visitas:** abra `https://bgaliz.github.io/?eu=1` uma vez em cada navegador
seu, e ele deixa de ser contado (`?eu=0` desfaz).

## Privacidade

**O IP nunca é gravado.** Ele existe só em memória, por um instante, para compor
`sha256(ip + user-agent + dia + sal)`. O sal roda diariamente: o hash de hoje não pode ser ligado ao
de ontem nem revertido para o IP.

Sem cookies. Sem terceiros. Sessão em `sessionStorage`, que morre com a aba. `Do Not Track` e
`Global Privacy Control` são respeitados sem o usuário precisar fazer nada.

### Links marcados

Ao enviar o portfólio para um contato ou proposta, use uma etiqueta:

```
https://bgaliz.github.io/?ref=nubank-proposta-front
```

O painel mostra quantas aberturas, quantas pessoas distintas, quando foi a primeira e a última, e se
houve clique em contato. É o que responde *"o que eu enviei foi aberto?"*.

O painel tem um gerador que monta essas etiquetas.

---

## Decisões que talvez surpreendam

**A home tem a ordem e os títulos de um currículo.** Resumo, Experiência, Projetos,
Competências, Formação, Contato: é o que ATS e leitores por IA reconhecem como campo. A
história (ano que rola, régua, "Levei daqui") é uma camada para a pessoa, dentro da
Experiência; para a máquina, a página continua sendo um currículo em ordem de leitura.

**Cada cargo abre pela principal entrega**, definida pelo Bruno. Ela é o título do
capítulo, o primeiro tópico do cargo e o primeiro destaque no JSON Resume: o que o robô
pesa primeiro.

**Métricas só se forem explicáveis.** Os currículos antigos se contradiziam (10.000 vs
50.000 usuários; 10% vs 40%). Número que muda conforme o documento não sobrevive à pergunta
"como você mediu?".

**"Pleno" no título**, não "Sênior": o Bruno tem quase 7 anos de carreira, mas Java e Spring
desde 2025, e 71% das vagas da amostra pedem Java.

**Sem `loading="lazy"` nem `decoding="async"` nas prévias.** Robô de screenshot não rola
nem espera decodificação: as imagens apareciam como caixas cinzas na captura de página
inteira. As seis somam ~150 KB e carregam com prioridade baixa.

**Telefone fora do JSON-LD.** Dado público estruturado é o primeiro alvo de raspagem para
spam; ele continua no botão de WhatsApp e no PDF.

**Painel por cookie HttpOnly**, não token no localStorage. Ver "Painel" acima.

---

## Acessibilidade

- Contraste AA conferido nos dois temas (valores em `DESIGN.md` e em `tokens.css`)
- Navegação completa por teclado, foco sempre visível em terra
- Todo o conteúdo existe sem JavaScript e sem rolar (`npm run robo`)
- `prefers-reduced-motion` desliga toda animação, mantendo hover e foco
- Títulos de seção em hierarquia de currículo; períodos com `<time datetime>`
