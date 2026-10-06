# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do repositorio

Front-end do APIFootballScout (scouting de atletas e gestao de transferencias). Ainda nao ha codigo: o repo tem so documentacao e o design system. A ordem de execucao esta em `docs/plano-de-desenvolvimento.md` (secao 8); os ADRs e o glossario estao prontos e o scaffold vem depois da skill `scout-ui`. Quando o scaffold existir, atualize este arquivo com os comandos reais (build, lint, teste unitario isolado, `gen:api`).

Stack planejada (secao 6 do plano): React + Vite + TypeScript (SPA), TanStack Router com search params tipados, orval gerando hooks do TanStack Query + zod + handlers MSW, Radix/React Aria com CSS proprio sobre os tokens, Storybook (uma story por estado), Vitest + Testing Library e Playwright. CI roda `gen:api` + `git diff --exit-code` para pegar drift do contrato.

## Fontes da verdade

- **`GLOSSARY.md`**: o nome de cada conceito do dominio e os sinonimos a evitar. Nomes de componentes, rotas, testes e textos da tela seguem ele.

- **Contrato da API**: OpenAPI em `/openapi/v1.json` do back-end (`https://localhost:7163`, prefixo `/api`). Rotas, payloads e enums vem dele; nunca escreva tipos a mao, gere o client. O back-end (.NET) fica em `../APIFootbalScout`; regras de negocio em `docs/regras-de-negocio.md` e features em `docs/features.md` de la.
- **`docs/README.md`**: o que o contrato nao mostra — valores do `ScoutConfig` que a validacao do front replica, tempo de vida dos tokens, convencoes de serializacao.
- **`docs/erros.md`**: tratamento por `code` do `ProblemDetails`.
- **`docs/fluxos-de-tela.md`**: jornadas, sessao/refresh e estados por feature.
- **`docs/adr/`**: decisoes de arquitetura do front (tokens, refresh, recorte na URL, shortlist, CSS Modules). Leia antes de mexer nessas areas; para reverter uma, escreva um ADR novo que a substitua.
- **`docs/design-system/`**: Scout Vestiario (so tema escuro). `README.md` tem as regras de uso, `tokens.json` os tokens. Os componentes em `components/` sao referencia em `React.createElement` + `bundle.css`, nao codigo de producao. Edite o repo primeiro e so depois republique o artefato https://claude.ai/artifact/MJ6hRhufGtPfdXq19TqkxD.

`docs/erros.md` e `docs/fluxos-de-tela.md` sao copias de `docs/frontend/` do back-end e podem divergir; na duvida, confira la.

## Regras que atravessam varias telas

- **Recorte** = `competicaoId` + `temporadaId` + `contexto` (`Clube`/`Selecao`). Metricas, comparacao e acompanhamento exigem os tres. Nao ha endpoint de competicoes/temporadas: o seletor deriva de `stats` em `GET /api/Players/{id}/profile`, que precisa carregar antes de qualquer tela de analise. O recorte vai na URL.
- **Recusa nao e erro.** `Recusada`, `Indisponivel`, `AmostraInsuficiente`, `TemporadaVirada` chegam com `200 OK`. A linha continua visivel, com o motivo e os numeros no lugar do valor ("Amostra insuficiente: 312 de 450 min"). Nunca mostre o nome do enum cru.
- **Erros**: a mensagem e o comportamento saem do campo `code`; `detail` e diagnostico e nao vai para a tela. Sem `code` = erro desconhecido (500). `Players` e `Tournament` respondem texto puro, nao JSON, e o interceptor precisa tolerar isso. Todo 502 (SofaScore fora) oferece "Tentar de novo". Recurso de outro olheiro responde 404, nunca 403.
- **Sessao**: access token de 15 min, refresh de 7 dias. Todo refresh rotaciona o refresh token; um refresh em voo por vez e as demais requisicoes aguardam e repetem. `change-password` tambem devolve par novo.
- **Serializacao**: enums como string, campos nulos omitidos do JSON (ausente = "nao se aplica"), datas ISO 8601.
- **Shortlist** sem atualizacao otimista: o estado local e substituido pela resposta. Use `limiteDeAlvos` da resposta, nao um literal.
- **Payload do SofaScore** muda conforme a fonte: use so os campos que a tela le. `entity.position` da busca (`"M"`, `"F"`...) nao e o enum `Posicao` da analise. Filtre a busca por `type === 'player'`.

## Design system em resumo

Detalhes em `docs/design-system/README.md`; os pontos que mais se erram:

- Texto em pt-BR, so a primeira letra maiuscula, sem emoji, numeros no padrao brasileiro (`2,10`, `€12,5M`) e toda metrica com unidade.
- `pitch` e o unico acento (aba selecionada, foco, ponto ativo), nunca decoracao. Mudancas usam `up`/`down` sempre com sinal e palavra.
- Archivo para nomes, titulos e numeros (`tabular-nums`); Figtree para o resto. Rotulo embaixo do valor, sem caixa alta.
- Cartoes sem sombra; carregamento com skeleton no formato final; sem animacao de entrada.
- Icones so do Phosphor (`@phosphor-icons/react`, regular, 20px), da lista aprovada em `assets/Icons/`.
- A faixa do clube usa `team.teamColors` do perfil, com a regra de fallback da `ClubBand`.

## Convencoes de trabalho

- Sem comentarios no codigo; nos testes, so os marcadores Arrange/Act/Assert.
- No `/tdd`, gere testes e stubs ate o red; o green e do usuario. Decida pelo doc de regras e pelo repo e declare a decisao, em vez de perguntar antes.
- Commits curtos, so o titulo, em portugues com prefixo convencional (`feat:`, `test:`, `docs:`, `chore:`). Em cada ciclo de TDD, um commit `test:` e um `feat:` separados. Sem `Co-Authored-By` do Claude.
- Specs por feature em `specs/<id-do-backend>-<nome>/` (`requisitos.md` em EARS, `design.md`, `tarefas.md`), com os mesmos identificadores do back-end (F9, F10...).
