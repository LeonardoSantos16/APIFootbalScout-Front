# Grilling: F1/F2 Acompanhamento

Decisoes fechadas no grilling do item 6 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `f1-f2-acompanhamento` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md).

## Fatos do contrato e do back-end

Conferidos antes do grilling, mudam as respostas abaixo:

- O `AcompanhamentoController` so tem `POST /api/Acompanhamento` (abre no recorte `competicaoId` + `temporadaId` + `contexto`, `201` com `dossieId`, `abertoEm`, `medidaEm`) e `GET /api/Acompanhamento/{jogadorId}` (leitura: `janela` e as tres afericoes). O dominio tem `Dossie.Encerrar` e um contador de ativos no Mongo, mas nenhum endpoint lista os acompanhamentos, devolve o consumo do limite ou encerra.
- O `GET` nao recebe recorte nem devolve o recorte do acompanhamento. Sem acompanhamento ativo, responde `404 acompanhamento.dossie_nao_encontrado`.
- Toda leitura consulta o SofaScore e pode responder `502`.
- Limiares (`ScoutConfig`): 180 min de minutagem e 10% de valor de mercado. Limite de 10 acompanhamentos ativos (`LimiteObservacoesJogadores`).
- `variacaoPercentualAbsoluta` vem sem sinal. `MotivoDeIndisponibilidadeDto` e `MoedaInesperada` ou `TemporadaVirada`.

## Nome e escopo

- **Q1. Contrato pendente:** o snapshot com `If-Match`/`version` de Relatorio e Shortlist foi commitado no `develop` (`chore: atualiza o contrato da API`) antes de abrir a branch.
- **Q2. Nome:** change `f1-f2-acompanhamento`, branch `feat/f1-f2-acompanhamento`, capability `acompanhamento`.
- **Q3. Escopo:** so abrir e ler. A lista de acompanhados, o consumo "7 de 10" e o encerramento saem e viram o item 6b do planejamento, dependente do back-end. O limite aparece so quando o `POST` responde `422`; o "desabilitar antes do 422" do `fluxos-de-tela.md` fica na divida tecnica.

## Tela

- **Q4. Onde mora:** aba "Acompanhamento" no layout do jogador, em `/jogadores/$jogadorId/acompanhamento`. A aba chama o `GET`; no `404 acompanhamento.dossie_nao_encontrado` mostra o estado "nao acompanhado" com o botao "Acompanhar". A area de acoes do perfil segue escondida.
- **Q5. Recorte:** abre com o recorte selecionado no `SliceSelect` do layout, que aparece so no estado "nao acompanhado". Acompanhado, a aba ignora o recorte da URL e nao mostra seletor nem recorte; mudar o recorte depois de acompanhar nao muda o painel. O recorte ausente na resposta vai para a divida tecnica.
- **Q16. Textos fixos e estados:**
  - Aba "Acompanhamento", titulo da pagina "Acompanhamento".
  - Carregando: skeleton da linha da janela e dos tres cartoes.
  - Nao acompanhado: "Você não acompanha este jogador." e, embaixo, "Ao acompanhar, o clube, o valor de mercado e a minutagem de hoje viram a linha de base."; depois o `SliceSelect` e o botao "Acompanhar".
  - Acompanhado: linha da janela e os cartoes "Clube", "Valor de mercado" e "Minutagem", nessa ordem; lado a lado no desktop, empilhados em 375px.
  - Erro na leitura: mensagem por `code` com `describeError`, "Tentar de novo" no 502.

## Leitura

- **Q6. Janela:** "Linha de base de 22/10/2026 · comparando os últimos 27 dias", com a data de `janela.de` e `duracaoEmDias` arredondado para baixo; 1 dia: "comparando o último dia"; menos de 1 dia: "Linha de base medida hoje".
- **Q7. `ComMudanca`:**
  - Clube: "Flamengo → Palmeiras", sem `ChangeChip` (mudanca categorica).
  - Valor de mercado: "€12,5M → €15M" e `ChangeChip` "+20,0% alta" (`up`) ou "−20,0% queda" (`down`); o sinal sai de `atual` contra `anterior`, porque `variacaoPercentualAbsoluta` vem sem sinal.
  - Minutagem: "820 → 1.240 min" e `ChangeChip` `up` "+420 min a mais". A queda nao acontece: minutagem que diminui vira `TemporadaVirada`.
- **Q8. `SemMudancaRelevante`:** "Sem mudança relevante" e o valor atual atenuado ("€15M", "1.240 min", "Palmeiras"), sem chip e sem o limiar.
- **Q9/Q14. `Indisponivel`:** cartao atenuado, sem valores, com os textos do design system:
  - `MoedaInesperada`: "A fonte passou a publicar o valor em outra moeda; comparar seria enganoso."
  - `TemporadaVirada`: "A temporada virou e a minutagem zerou. A leitura antiga não é comparável."

## Abertura

- **Q10. Depois do "Acompanhar":** o `201` invalida e refaz o `GET`; o botao fica em carregamento ate a leitura voltar. O painel recem-aberto mostra "Linha de base medida hoje" com as afericoes que a leitura trouxer.
- **Q11. Erros**, junto ao botao, sem toast:
  - `409 acompanhamento.jogador_ja_acompanhado` (aberto em outra aba): refaz o `GET` e mostra o painel, sem mensagem.
  - `422 acompanhamento.limite_atingido`: "Limite de 10 acompanhamentos atingido.", sem o "Encerre um para abrir outro" do `erros.md`, porque nao ha como encerrar. O 10 vem de uma constante em `src/config/` (o `ScoutConfig` replicado).
  - `422 jogador.informacoes_insuficientes`: "O jogador não tem dados suficientes para servir de linha de base."
  - `502`: mensagem padrao com "Tentar de novo".

## Cache

- **Q12.** Leitura com `staleTime` de 5 min, definido so no hook dela, inclusive o `404` de "nao acompanhado"; o "Acompanhar" invalida.

## Design system e componentes

- **Q14.** O `MeasurementCard` e o `ChangeChip` ja estao no design system; o wireframe nao pede componente novo. No `MeasurementCard/README.md` so muda a linha da janela, para o texto da Q6.
- **Q17.** `ChangeChip` em `src/components/` (generico, reaproveitavel). `MeasurementCard` em `src/pages/tracking/components/`, sobe quando outra tela precisar. Os dois entram com stories e testes em `feat:` por subtarefa.

## Mock

- **Q13.** Handlers por jogador:
  - 1001: acompanhado, com mudanca nas tres afericoes.
  - 1002: acompanhado, sem mudanca relevante.
  - 1003: acompanhado, clube com mudanca, valor e minutagem indisponiveis (`MoedaInesperada`, `TemporadaVirada`).
  - 1004: nao acompanhado; "Acompanhar" funciona.
  - 1005: nao acompanhado; "Acompanhar" responde `422 acompanhamento.limite_atingido`.
  - 1006: nao acompanhado; "Acompanhar" responde `422 jogador.informacoes_insuficientes`.
  - 1007: leitura com `502`.

## Wireframe

Aprovado em https://claude.ai/artifact/BzMwpv7rWYKeqeW4ursJek. Decisoes que sairam dele:

- **W1.** `SemMudancaRelevante` com o valor atual em `ink-muted`, confirmando a Q8; o `MeasurementCard` do design system passa a pintar assim (README e `bundle.css`).
- **W2.** Os dois `422` aparecem no `Notice`, logo abaixo do botao, que segue habilitado: o olheiro pode trocar o recorte e tentar de novo.
- **W3.** Enquanto abre (do clique ate a leitura voltar, tambem depois do `409`), o seletor e o botao ficam desabilitados e o botao diz "Acompanhando…".
- **W4.** `502` ao acompanhar: `InlineError` "Não foi possível acompanhar agora." no lugar do botao; "Tentar de novo" repete o `POST` com o mesmo recorte.
- **W5.** `502` na leitura: "Não foi possível ler o acompanhamento agora." com "Tentar de novo".
- **W6.** Perfil sem recortes: o texto do estado vazio das Metricas, so no estado "nao acompanhado". Acompanhado, o painel aparece mesmo sem recortes.
- **W7.** "Acompanhar" e o botao primario (pilula branca), ao lado do seletor no desktop; em 375px os dois ocupam a largura toda.
- **W8.** Ate 720px as abas do jogador ficam numa linha so, distribuidas na largura (`space-between`, no minimo `space-3`), sem rolagem; so quebram linha quando nao cabem. Muda o `Tabs` de producao e o do design system.

## Glossario e divida tecnica

- **Q15.** Entram em "Nomes no código": Acompanhamento (`Tracking`, `TrackingPage`), Linha de base (`baseline`), Leitura (`reading`), Janela (`TrackingWindow`), Aferição (`Measurement`), Mudança relevante (`relevantChange`), Indisponível (`unavailable`).
- Na divida tecnica: endpoints de listar e encerrar acompanhamentos (com o consumo do limite) e o recorte ausente na leitura.
