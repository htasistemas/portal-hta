# Auditoria e plano de SEO — TorreSoft Brasil

Data da implementação: 11/10/2026

## Diagnóstico inicial

- A home e a página de terceiro setor já tinham `lang="pt-BR"`, viewport, canonical, Open Graph e Twitter Cards.
- A hierarquia principal estava funcional, com um H1 por página, mas a página prioritária não explicava de forma suficiente os módulos reais apresentados pelo G3N.
- O JSON-LD existente misturava propriedades de `Organization` dentro de `publisher` de uma `WebPage`; foi substituído por grafos separados e mais legíveis.
- O terceiro setor continha percentuais e alegações de resultados de clientes sem fonte verificável. Esses elementos foram removidos.
- Não havia GA4/GTM identificável no código. Foi criada uma camada de eventos que só envia dados se um `dataLayer` já existir.
- Não foram encontradas imagens sem `alt` nas páginas HTML auditadas.
- O sitemap tinha `index.html` como URL principal; foi trocado pela URL canônica `/`.

## Alterações realizadas

- Home: title, description e dados estruturados `Organization`, `WebSite` e `WebPage` revisados.
- `terceiro-setor.html`: title, description, conteúdo comercial, módulos do G3N, planos Essencial, Profissional, Premium e Enterprise, CTAs, `SoftwareApplication` e `BreadcrumbList` revisados.
- `terceiro-setor.html`: FAQ visível e dados estruturados `FAQPage` adicionados com respostas sustentadas pelo conteúdo da página.
- Home: métricas numéricas e depoimento nominal sem fonte foram substituídos por etapas de atendimento e descrição institucional.
- `robots.txt`: caminhos operacionais `/api/`, `/src/` e `intranet.html` excluídos do rastreamento comercial.
- `sitemap.xml`: URL raiz corrigida e página prioritária atualizada.
- `intranet.html`: `noindex, nofollow` adicionado.
- `assets/js/main.js`: eventos opcionais para demonstração, WhatsApp, conhecer o G3N e envio do formulário.

## URLs estratégicas

Nenhuma nova URL foi criada nesta etapa. A criação de páginas para “sistema para ONGs”, “gestão de beneficiários”, “sistema para OSCs”, “gestão de projetos sociais” e “controle de atendimentos sociais” foi adiada porque o repositório não fornece conteúdo específico suficiente para sustentar cinco páginas originais sem risco de páginas repetitivas ou funcionalidades não confirmadas.

## Títulos e descrições atuais

| URL | Title | Meta description |
| --- | --- | --- |
| `/` | TorreSoft Brasil \| Sistemas de Gestão para Empresas e Terceiro Setor | Conheça os sistemas de gestão da TorreSoft Brasil para empresas, hotelaria e organizações do terceiro setor. Tecnologia para organizar operações e decisões. |
| `/terceiro-setor.html` | Sistema de Gestão para ONGs e OSCs \| G3N TorreSoft | Conheça o G3N, sistema para gestão de ONGs, OSCs e instituições sociais. Organize projetos, convênios, financeiro, pessoas e prestação de contas. |
| `/g3n.html` | G3N \| Gestão Inteligente para o Terceiro Setor - TorreSoft Sistemas | G3N: A solução definitiva de gestão para o Terceiro Setor. Transparência, eficiência e controle total. |
| `/solucoes.html` | Soluções \| TorreSoft Sistemas | Conheça o ecossistema completo de soluções da TorreSoft Sistemas: G3N, Hotelaria, Finance Pro, CRM e muito mais. |
| `/contato.html` | Contato \| TorreSoft Sistemas - Soluções em Tecnologia | Entre em contato com a TorreSoft Sistemas. Solicite uma demonstração ou tire suas dúvidas com nossos especialistas. |

As demais páginas mantiveram seus títulos e descrições existentes porque não eram o foco prioritário desta alteração; devem ser revisadas em uma segunda rodada de conteúdo.

## Validação e operação

- Validar os JSON-LD em https://search.google.com/test/rich-results e no Schema Markup Validator após publicar.
- Testar as URLs públicas, formulário e links no ambiente de hospedagem.
- Verificar Core Web Vitals no PageSpeed Insights; imagens externas em CSS continuam sendo um ponto para otimização futura.
- No Search Console: verificar o domínio, enviar `/sitemap.xml`, inspecionar `/terceiro-setor.html`, solicitar indexação e monitorar cobertura.

### Plano 30 / 60 / 90 dias

- 30 dias: confirmar rastreamento, indexação, erros e eventos; corrigir URLs ou recursos bloqueados.
- 60 dias: comparar impressões, cliques, CTR e posição para consultas de terceiro setor; melhorar trechos com muitas impressões e baixo CTR.
- 90 dias: avaliar leads atribuídos aos CTAs, ampliar conteúdo baseado em consultas reais e decidir páginas estratégicas somente quando houver conteúdo original e evidência de demanda.

