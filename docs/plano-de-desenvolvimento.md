# Plano de desenvolvimento do front-end

Abordagens, ferramentas e estimativa para construir a interface do APIFootballScout com desenvolvimento orientado a spec (SDD) e apoio de agentes de IA. Complementa [README.md](README.md), [fluxos-de-tela.md](fluxos-de-tela.md) e [erros.md](erros.md).

## 1. Ponto de partida

Os documentos do front ja funcionam como spec: o contrato OpenAPI cobre rotas e tipos, `erros.md` cobre o tratamento por `code`, e `fluxos-de-tela.md` cobre jornadas e estados.

O mapa de estados e a identidade do produto. `Recusada`, `Indisponivel`, `AmostraInsuficiente` e `TemporadaVirada` chegam com `200 OK` e nao sao erro. Uma interface generica trata tudo como carregando / sucesso / erro; esta precisa mostrar **por que** o dado nao existe. O design parte daqui.

Decisoes registradas como ADR em [`adr/`](adr/):

| Decisao | Direcao sugerida |
| --- | --- |
| Recorte selecionado | Na URL (`?competicao=&temporada=&contexto=`): sobrevive ao reload, e compartilhavel e e reaproveitado entre metricas, comparacao e acompanhamento |
| Armazenamento dos tokens | `localStorage` no inicio, com a troca para refresh em cookie `httpOnly` registrada como evolucao |
| Requisicoes durante o refresh | Fila unica: um refresh em voo, as demais requisicoes aguardam e sao repetidas |
| Shortlist | Sem estado otimista: o estado local e sempre substituido pela resposta |

## 2. Evitar a "cara de IA"

A estetica generica vem de shadcn sem customizacao, Inter em tudo, gradiente roxo, cards com icone e emoji, hero section e espaco em branco em excesso.

- **Referencia real antes do codigo.** Ferramentas de analise (FBref, Wyscout, StatsBomb), editorial esportivo (The Athletic) ou planilha de olheiro. Um moodboard de 5 a 10 capturas guia o agente melhor que qualquer adjetivo.
- **Densidade e tabela.** Olheiro le numero: `font-variant-numeric: tabular-nums`, alinhamento a direita, linhas finas, pouca sombra.
- **Tokens primeiro.** Paleta curta com um acento so, escala tipografica com no maximo duas familias (uma condensada para titulos, uma neutra para dados), espacamentos e raios definidos. O agente recebe isso como regra, nao como sugestao.
- **Componentes headless** (Radix, React Aria) com estilo proprio. Se usar shadcn, reescrever os tokens no primeiro dia.
- **Design antes do codigo.** Figma ou papel. O agente implementa o design; nao o inventa.
- **Estados recusados visiveis.** Linhas de metrica recusadas aparecem atenuadas com o motivo, nunca escondidas.

## 3. SDD

### Ferramentas

| Ferramenta | Perfil |
| --- | --- |
| GitHub Spec Kit | Fluxo `specify → plan → tasks → implement`, com uma "constitution" do projeto |
| OpenSpec | Leve, trabalha com propostas de mudanca sobre specs existentes |
| Kiro (AWS) | IDE spec-driven nativa, requisitos em EARS |
| BMAD Method | Papeis de PM, arquiteto e dev; pesado para um projeto deste tamanho |

### Formato proprio (recomendado para comecar)

Uma pasta por feature, com os mesmos identificadores do backend para manter a rastreabilidade:

```
specs/
  F9-metricas/
    requisitos.md   # EARS: "Quando a metrica for Recusada por AmostraInsuficiente, o sistema deve exibir..."
    design.md       # componentes, estados, rotas, endpoints consumidos
    tarefas.md      # passos pequenos e verificaveis
```

Depois de uma ou duas features no formato manual, adotar Spec Kit ou OpenSpec ja sabendo o que eles automatizam.

## 4. Skills

### Ja instaladas

| Skill | Uso no front |
| --- | --- |
| `grill-with-docs` / `grilling` | Estressar cada spec antes de implementar ("e se o perfil der 502 no meio da shortlist?") |
| `domain-modeling` | `GLOSSARY.md` do front com a linguagem do dominio: recorte, afericao, alvo, acompanhamento |
| `codebase-design` | Modulos profundos: client da API com refresh, dicionario de erros |
| `tdd` | Regras de finalizacao do relatorio, compatibilidade de posicoes, interceptor de `401` |
| `frontend-design` | Direcao estetica e implementacao de telas sem a estetica generica de IA |
| `extract-design-system` | Extrair tokens de um site de referencia; serviu pouco no FotMob e na Hydra e foi bloqueada no SofaScore |
| `web-design-guidelines` | Revisar a interface contra as Web Interface Guidelines da Vercel (acessibilidade e UX) |

### A buscar ou criar

- `webapp-testing` (`anthropics/skills`): testes Playwright guiados pelo agente.
- `scout-ui` (propria, via `skill-creator`): tokens, regra "recusa nao e erro", mensagem por `code`, proibicao de tipos escritos a mao. E o que mais garante consistencia entre sessoes.
- `/find-skills` para descobrir outras.

## 5. Agentes e ferramentas de apoio

| Ferramenta | Papel |
| --- | --- |
| Subagentes em `.claude/agents/` | `ui-reviewer` (confere capturas contra tokens e mapa de estados), `spec-checker` (codigo vs. spec da feature) |
| Playwright MCP / Claude in Chrome | Loop visual: o agente abre a tela, captura, compara com a referencia e ajusta |
| Figma MCP | Leitura direta de frames e tokens, se o design for no Figma |
| Context7 MCP | Documentacao atualizada das bibliotecas, evita APIs inventadas |
| Hooks do Claude Code | `tsc` e lint a cada edicao, para o agente corrigir antes da revisao |
| v0 / Lovable | Apenas exploracao de layout; o codigo e descartado |

## 6. Stack

| Camada | Escolha |
| --- | --- |
| Base | React + Vite + TypeScript (SPA; Next.js e desnecessario) |
| Rotas | TanStack Router, com search params tipados para o recorte |
| Dados | orval gerando hooks do TanStack Query, schemas zod e handlers MSW |
| Mocks | MSW a partir do OpenAPI: desenvolvimento sem SofaScore e sem a API, com cada estado forcavel (`Recusada`, `502`...) |
| Componentes | Radix ou React Aria + CSS proprio sobre os tokens |
| Spec visual | Storybook, uma story por estado de cada componente; Chromatic ou teste visual do Playwright para regressao |
| Testes | Vitest + Testing Library (unidade e componente), Playwright (e2e) |
| CI | `gen:api` + `git diff --exit-code` para detectar drift do contrato |

### Melhorias sugeridas no backend

- `GET /api/config` expondo o `ScoutConfig`, para o front nao repetir literais.
- Codigos de erro publicados como enum no OpenAPI, permitindo `Record<CodigoDeErro, string>` verificado pelo compilador.
- Endpoint de perfis em lote, eliminando as 25 chamadas da shortlist.
- `Players` e `Tournament` respondendo `ProblemDetails`.

## 7. Aprender com a IA

- **Escrever a mao as partes dificeis**: fila de refresh do `401`, repriorizacao da shortlist, formulario de relatorio com edicao parcial. O agente fica com scaffolding, stories e mocks
- **Plan mode antes de cada tarefa**, comparando o plano com a spec. A divergência e onde esta o aprendizado.
- **`/code-review` nos proprios diffs**, pedindo a explicacao de cada achado.
- **Retrospectiva por feature**: o que a spec nao previu? Corrigir a spec, a skill `scout-ui` ou o `CLAUDE.md`. Melhorar o contexto e a habilidade central de desenvolver com IA.

## 8. Ordem de execucao

1. ~~Moodboard e tokens.~~ Concluido: das tres direcoes testadas, a escolhida foi a A (Vestiario, inspirada no FotMob). O design system esta em [`design-system/`](design-system/README.md), com tokens, nove componentes de referencia, icones Phosphor e a regra da faixa do clube a partir de `teamColors`.
2. ~~ADRs.~~ Concluido: tokens de sessao, refresh com fila, recorte na URL e shortlist sem otimismo estao em [`adr/`](adr/).
3. ~~`CONTEXT.md` do front.~~ Concluido como [`GLOSSARY.md`](../GLOSSARY.md), o nome que as skills `domain-modeling`, `tdd` e `codebase-design` leem.
4. Scaffold: Vite, cliente tipado da API, MSW, Storybook, CI. O `CLAUDE.md` ja existe e ganha os comandos reais aqui.
5. Skill `scout-ui`, escrita depois do scaffold para apontar componentes, formatadores e o dicionario de erros reais, em vez de repetir os docs.
6. F9 Metricas como primeira feature completa em SDD — pequena, somente leitura e rica em estados.
7. Retrospectiva e demais features.

## 9. Estimativa

Premissas: um desenvolvedor, backend pronto e estavel, escopo dos documentos atuais (sem features fora de escopo), desktop primeiro com responsivo basico, agente de IA no fluxo.

| Etapa | Horas |
| --- | --- |
| Moodboard, tokens e design das telas principais | 10–16 |
| ADRs, `GLOSSARY.md`, skill `scout-ui`, `CLAUDE.md` | 4–6 |
| Scaffold (Vite, orval, MSW, Storybook, CI) | 6–10 |
| Sessao: signup, signin, refresh com fila, `me`, signout, troca de senha | 10–14 |
| Busca, perfil e seletor de recorte | 8–12 |
| F9 Metricas por 90 | 6–8 |
| F10 Comparacao direta | 8–12 |
| F1/F2 Acompanhamento e deteccao de mudanca | 8–12 |
| F5 Relatorio (rascunho, finalizacao, correcoes, linha do tempo) | 12–18 |
| F7 Shortlist (drag-and-drop, moeda travada, perfis em cache) | 12–16 |
| Layout geral, navegacao, acessibilidade, responsivo | 8–12 |
| Testes e2e dos fluxos principais | 8–12 |
| Deploy e ajustes finais | 4–6 |
| **Total** | **~105–155 h** |

O plano privilegia aprendizado — specs escritas a mao, partes dificeis implementadas sem o agente, retrospectivas — o que acrescenta de 25% a 40%: **~130–210 h**.

| Ritmo | Prazo |
| --- | --- |
| Tempo integral (~35 h/semana) | 4–6 semanas |
| Meio periodo (~15 h/semana) | 2–3,5 meses |
| Fins de semana (~8 h/semana) | 4–6 meses |

Maiores riscos para o prazo: o design (iteracao visual tende a se estender), o fluxo de refresh com requisicoes concorrentes e as variacoes do payload do SofaScore. Recalibrar a estimativa depois da F9 — a primeira feature completa mostra o ritmo real.
