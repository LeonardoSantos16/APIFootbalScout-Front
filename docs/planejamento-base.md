# Planejamento base

O que o front vai entregar, em que ordem e por qual fluxo. Este documento so planeja: nao ha spec nem codigo de feature aqui. Cada item vira spec quando entrar em execucao, ja com o aprendizado do anterior. Complementa [plano-de-desenvolvimento.md](plano-de-desenvolvimento.md) (abordagem, stack e estimativa) e [fluxos-de-tela.md](fluxos-de-tela.md) (jornadas e estados).

## Fluxo de cada item

Cada item comeca numa branch propria a partir de `develop`, com o nome da change (`feat/f9-metricas-por-90`).

| Etapa | Ferramenta | Entrada | Saida |
| --- | --- | --- | --- |
| 1. Grilling | skill `grilling` (ou `grill-with-docs`) | o item deste documento e as perguntas dele | decisoes fechadas em `docs/grilling/<change>.md` (uma secao por pergunta, com a resposta); termos novos no `GLOSSARY.md`, decisoes de arquitetura em `docs/adr/`, pendencias do back-end em `docs/divida-tecnica.md` |
| 2. Wireframe | artefato no claude.ai, um por tela, nao versionado | as decisoes do grilling e os estados de `fluxos-de-tela.md` | wireframe de baixa fidelidade com a tela em cada estado (carregando, sucesso, vazio ou recusado, erro), aprovado antes da spec; componente novo que o wireframe pedir entra no design system primeiro |
| 3. Spec | OpenSpec (`/openspec-propose`) | as decisoes do grilling e o wireframe aprovado | change em `openspec/changes/<nome>/` com `proposal.md`, specs delta, `design.md` (com o link do wireframe) e `tasks.md`, valida em `openspec validate <nome> --strict` |
| 4. TDD | `/openspec-apply-change` | `tasks.md` | um grupo do `tasks.md` por vez: o red de todas as subtarefas do grupo (commit `test:`), depois o green do grupo inteiro (commit `feat:`). Grupos sem regra de dominio (componentes, mocks, dependencias) vao direto em `feat:` ou `chore:` por subtarefa, com os testes junto. O green da tela so e commitado depois da conferencia no navegador |
| 5. Conferencia | `npm run dev:mock` e `npm run storybook` | as stories por estado e os jogadores do mock | cada estado da tela bate com o wireframe, em desktop e em 375px, sem erro no console; `lint`, `typecheck`, `test` e `build` passam |

Ao fim de cada item: retrospectiva (o que a spec nao previu, ajustes na skill `scout-ui`, no `CLAUDE.md` e nas specs delta) e `/openspec-archive-change`, que cria ou atualiza as specs principais em `openspec/specs/` a partir das deltas e move a change para `openspec/changes/archive/<data>-<change>/`. A decisao que muda durante a implementacao volta para a spec delta antes do archive.

Itens sem tela (CI, testes e2e, deploy) pulam o wireframe.

O contexto e as regras por artefato do OpenSpec ficam em `openspec/config.yaml`.

## Ordem

| # | Item | Capabilities previstas | Depende de |
| --- | --- | --- | --- |
| 1 | CI | nenhuma (tooling) | scaffold |
| 2 | F9 Metricas por 90 | `recorte`, `metricas-por-90`, `tratamento-de-erros` | 1 |
| 3 | Sessao | `sessao` | 2 |
| 4 | Busca e perfil | `busca-de-jogadores`, `perfil-do-jogador` | 2, 3 |
| 5 | F10 Comparacao direta | `comparacao-direta` | 2, 4 |
| 6 | F1/F2 Acompanhamento | `acompanhamento` | 4 |
| 7 | F5 Relatorio de scouting | `relatorio-de-scouting` | 4 |
| 8 | F7 Shortlist priorizada | `shortlist-priorizada` | 4 |
| 9 | Navegacao e acessibilidade | `navegacao` | 2–8 |
| 10 | Testes e2e | nenhuma (tooling) | 1; cresce a partir de 3 |
| 11 | Deploy | nenhuma (infra) | 1–9 |

O CI vem primeiro para que todo ciclo de TDD das features ja rode contra ele. A F9 vem antes da sessao porque roda inteira com `npm run dev:mock`. Contra a API real, todo endpoint fora de `/api/Auth` exige token. Os itens 5 a 8 nao dependem entre si e podem trocar de ordem.

Nome da change no OpenSpec: identificador do back-end + nome (`f9-metricas-por-90`). Nome da capability: termo do glossario, sem identificador. Itens de tooling e infra entram como change com `skip_specs: true`.

## 1. CI

O workflow `.github/workflows/ci.yml` ja existe desde o scaffold: em push na `main` e em pull request, roda `gen:api` e `gen:tokens` com `git diff --exit-code`, `lint`, `typecheck`, `test`, `build` e `build-storybook`. Este item completa o que falta para ele servir de rede de seguranca do fluxo grilling -> wireframe -> spec -> TDD.

## 2. F9 Metricas por 90

Primeira feature completa: pequena, somente leitura e rica em estados. Estreia o recorte, a regra "recusa nao e erro" e o tratamento de erro por `code`.

- **Escopo:** as sete linhas fixas (`Gols`, `Assistencias`, `PassesDecisivos`, `Desarmes`, `Interceptacoes`, `Rating`, `PrecisaoDePasse`), nunca filtradas. Calculada mostra valor, unidade e amostra; recusada fica visivel com o motivo e os numeros. Seletor de recorte derivado de `stats` do perfil, na URL (ADR 0003). Cabecalho minimo do jogador. Esqueleto da pagina com a navegacao no topo (busca e links ainda sem destino) e a coluna de apoio vazia. Erro generico por `code`, "Tentar de novo" no 502. Primeiros componentes de producao e formatadores pt-BR.
- **Endpoints:** `GET /api/Players/{id}/profile`, `GET /api/Analise/{jogadorId}/metricas-por-90`.
- **Para o grilling:**
  - Qual recorte vem selecionado quando a URL nao traz nenhum? O mais recente? O de mais minutos?
  - O que a tela mostra quando o perfil nao tem `stats`, ou tem so recortes de `Selecao`?
  - Os nomes de competicao e temporada vem de `stats`, ou e preciso `GET /api/Tournament/tournament`?
  - Recorte na URL que nao existe em `stats`: corrigir em silencio ou avisar?
  - Quais componentes do design system entram agora e quais esperam a feature que precisar deles?
- **Fora do escopo:** busca, perfil completo, login, radar.

## 3. Sessao

Todo endpoint fora de `/api/Auth` exige token. A renovacao com rotacao e requisicoes concorrentes e um dos maiores riscos do plano. Decisoes em [grilling/sessao.md](grilling/sessao.md).

- **Escopo:** criar conta e entrar; par de tokens no `localStorage` (ADR 0001); renovacao com fila unica no primeiro `401`, ou antes de enviar quando o access token ja venceu, sem timer (ADR 0002); `me` no boot; rotas protegidas preservando o destino; sair e sair de todos; troca de senha; exclusao da conta.
- **Endpoints:** todos de `/api/Auth`.
- **Para o grilling:**
  - ~~Com que antecedencia renovar antes de `accessTokenExpiresAtUtc`?~~ Sem renovacao proativa por timer (ADR 0002).
  - Duas abas abertas: uma rotaciona o refresh token e a outra fica com o antigo. Sincronizar pelo evento `storage`?
  - Refresh falhou com requisicoes na fila: todas falham juntas e a sessao cai de uma vez?
  - Troca de senha derruba as outras sessoes; a sessao atual continua com o par novo?
  - Exclusao da conta: qual confirmacao, e para onde o olheiro vai depois?
- **Fora do escopo:** refresh em cookie `httpOnly`, recuperacao de senha.

## 4. Busca e perfil

O perfil e a porta de entrada de todas as acoes do olheiro, e a busca e o unico jeito de chegar a ele.

- **Escopo:** busca filtrada por `type === 'player'`; perfil com dados cadastrais, clube e faixa de `teamColors`, valor de mercado, recortes e transferencias; atalhos para as acoes, cada um habilitado quando a feature dele entrar; cache dos perfis por id.
- **Endpoints:** `GET /api/Players/search`, `GET /api/Players/{id}/profile`.
- **Para o grilling:**
  - Busca enquanto digita (com atraso e tamanho minimo) ou ao enviar?
  - Quais campos do payload do SofaScore a tela le, e o que mostra quando um falta?
  - Por quanto tempo o perfil em cache vale? A shortlist reaproveita o mesmo cache.
  - O seletor de recorte passa a morar no perfil e as telas de analise o herdam?
  - Recorte padrao: o maior `season.id` nao e o mais recente (achado na sessao, `divida-tecnica.md`). Ordenar pelo ano da temporada ou manter a ordem de `stats` da fonte?
- **Fora do escopo:** busca de clubes e competicoes.

## 5. F10 Comparacao direta

Head-to-head entre dois jogadores no mesmo recorte. A recusa inteira e a recusa de um atributo para um lado so sao resultados, nao falhas.

- **Escopo:** segundo jogador escolhido pela busca, ja filtrado por posicoes compativeis; tabela lado a lado na `Realizada`, sem vencedor em atributo recusado; estado proprio na `Recusada`, com o motivo e os dois jogadores; comparacao na URL.
- **Endpoints:** `GET /api/Analise/comparacao`.
- **Para o grilling:**
  - A busca do segundo jogador usa a posicao curta da fonte (`"M"`, `"F"`), que nao e o enum `Posicao`. Como filtrar antes de ter a posicao da analise?
  - Como destacar o melhor de uma linha sem usar `pitch` como decoracao?
  - Em quantos atributos comparaveis a comparacao inteira e recusada, e a tela antecipa isso?
- **Fora do escopo:** radar, mais de dois jogadores.

## 6. F1/F2 Acompanhamento

"O que mudou desde que comecei a acompanhar." A tela compara contra a linha de base congelada na abertura, nao contra um historico.

- **Escopo:** acompanhar a partir do perfil no recorte selecionado; janela ("comparando os ultimos 27 dias"); tres afericoes independentes, cada uma `ComMudanca`, `SemMudancaRelevante` ou `Indisponivel` com texto proprio para `MoedaInesperada` e `TemporadaVirada`; limite de 10 ativos.
- **Endpoints:** `POST /api/Acompanhamento`, `GET /api/Acompanhamento/{jogadorId}`.
- **Para o grilling:**
  - O contrato nao lista os acompanhamentos ativos nem encerra um acompanhamento. Sem isso, de onde vem o "7 de 10" e a lista de acompanhados? Pedir os endpoints ao back-end ou cortar do escopo?
  - Como o perfil sabe se o jogador ja e acompanhado sem chamar o painel?
  - Qual recorte o painel usa se o olheiro mudou o recorte depois de acompanhar?
- **Fora do escopo:** serie acumulada, alertas.

## 7. F5 Relatorio de scouting

A avaliacao do olheiro. Edicao parcial com listas substituidas por inteiro, pre-requisitos para finalizar e imutabilidade depois de finalizado. O formulario e uma das partes a escrever a mao.

- **Escopo:** rascunho a partir do perfil, sem exigir acompanhamento; edicao de nota, parecer, pontos positivos, negativos e observacoes; lista do que falta para finalizar; finalizar; criar correcao; linha do tempo por jogador agrupada por `corrigeRelatorioId`.
- **Endpoints:** todos de `/api/Relatorio`.
- **Para o grilling:**
  - Salvar a cada mudanca, com atraso, ou num botao? E o que acontece com uma edicao em voo quando outra comeca?
  - Como a lista do que falta aparece sem virar um muro de erros antes de o olheiro comecar?
  - Uma correcao de uma correcao: a linha do tempo mostra a cadeia inteira?
  - Data de observacao: padrao hoje ou vazia?
- **Fora do escopo:** relatorio de partida, exportacao em PDF.

## 8. F7 Shortlist priorizada

Lista ordenada de alvos com prioridade `1..n` contigua. A tela reflete sempre a resposta do servidor (ADR 0004). A repriorizacao e uma das partes a escrever a mao.

- **Escopo:** criar e listar shortlists; alvos em ordem com nome e foto do perfil em cache; adicionar a partir do perfil; repriorizar por arrastar e por teclado; remover; moeda travada pelo primeiro alvo; limite de `limiteDeAlvos` da resposta; `custoTotal` do servidor.
- **Endpoints:** todos de `/api/Shortlist`, mais o perfil de cada alvo.
- **Para o grilling:**
  - Sem otimismo, o que a tela mostra entre soltar o alvo e a resposta chegar?
  - Qual biblioteca de arrastar e soltar acessivel, ou so teclado e botoes no inicio?
  - Com varias shortlists, em qual o "adicionar" do perfil coloca o alvo?
  - 25 perfis carregando: skeleton por linha ou a lista espera todos?
- **Fora do escopo:** shortlist colaborativa, perfis em lote.

## 9. Navegacao e acessibilidade

Consolida o que cada feature entregou com navegacao minima. O header no topo entra na F9 como esqueleto; aqui ele ganha destinos, estado ativo e o menu do celular.

- **Escopo:** layout geral com navegacao entre busca, acompanhamentos, shortlists e conta; pagina inicial; rota inexistente; responsivo basico; revisao com `web-design-guidelines`.
- **Para o grilling:** o que a pagina inicial mostra; se a navegacao entra antes, junto da sessao.
- **Fora do escopo:** tema claro, PWA.

## 10. Testes e2e

Playwright contra `npm run dev:mock`, cobrindo os fluxos principais de cada feature, na CI depois do lint, do typecheck e dos testes de unidade. Avaliar regressao visual sobre as stories. Sem spec propria: os cenarios sao os das specs das features.

## 11. Deploy

Hospedagem com `/api` na mesma origem (a API nao tem CORS), fallback de rotas da SPA, MSW fora do build e deploy a partir da `main` com a CI verde. Provavelmente pede um ADR para a hospedagem.
