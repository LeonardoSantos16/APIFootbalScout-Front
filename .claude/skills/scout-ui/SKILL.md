---
name: scout-ui
description: Como construir telas, componentes, stories e mocks no front do APIFootballScout seguindo o design system Scout Vestiario, o contrato da API e a regra "recusa nao e erro". Use sempre que for criar ou alterar qualquer coisa em src/ que o olheiro ve (tela, rota, componente, hook de dados, CSS Module, story, handler MSW, texto da interface, formatacao de numero), mesmo que o pedido nao cite o design system, e tambem ao revisar uma tela ou implementar uma feature F1-F10.
---

# scout-ui

O olheiro le numeros e precisa saber **por que** um numero nao existe. Quase todo bug de interface neste projeto e um de tres: um estado tratado como erro quando e resultado, um tipo escrito a mao que divergiu da API, ou um valor visual que nao veio dos tokens. Este guia existe para evitar os tres.

## Antes de escrever

Leia so o que a tarefa toca:

- `GLOSSARY.md`: o termo certo para cada conceito. Vale para os textos da tela e para os nomes de dominio no codigo.
- `docs/fluxos-de-tela.md`: a secao da feature, com jornada, estados e regras de UX.
- `docs/erros.md`: os `code` que a feature pode receber e a mensagem de cada um.
- `docs/adr/`: decisoes que restringem a implementacao (recorte na URL, shortlist sem otimismo, refresh com fila, CSS Modules).
- `docs/design-system/README.md` e, se existir, `docs/design-system/components/<Componente>/README.md`: regras visuais e a referencia do componente.

## Dados

- Toda chamada passa por `$api` de `src/api/client.ts`: `$api.useQuery('get', '/api/...', { params })`, ou `fetchClient` fora de componente. Nunca `fetch` direto: e no cliente que ficam token, refresh e conversao de erro.
- Tipos da API vem de `src/api/schema.d.ts` (`components['schemas']['AtributoDto']`). Um tipo escrito a mao parece inofensivo ate o back-end mudar um campo e o compilador nao avisar.
- Os parametros de query do contrato estao em PascalCase (`CompeticaoId`, `TemporadaId`, `Contexto`). Escreva como o tipo pede.
- O recorte vem dos search params da rota (ADR 0003), nunca de estado local. Ele e derivado de `stats` do perfil, entao telas de analise carregam o perfil antes.
- O payload do SofaScore (`Players`, `Tournament`) muda conforme a fonte: leia so os campos que a tela usa e trate todos como possivelmente ausentes.

## Estados

Todo componente que mostra dado da API trata quatro situacoes, e as duas do meio sao as que se esquecem:

| Situacao | Como chega | Tela |
| --- | --- | --- |
| Carregando | sem `data`, ou `isError && isFetching` (nova tentativa em voo) | Skeleton em `surface-strong` no formato final; o layout nao pode pular quando o dado chega |
| Recusa ou indisponivel | `200 OK` com `resultado: 'Recusada'` ou `'Indisponivel'` e um `motivo` | O motivo, com os numeros, no lugar do valor; o rotulo continua. Nunca esconda a linha |
| Sucesso | `200 OK` | Valor formatado em pt-BR, com unidade |
| Erro | `ApiError` com `status` e `body` | Mensagem no proprio cartao com "Tentar de novo"; todo `502` oferece nova tentativa |

Resposta que nao fecha com a regra da tela (atributo faltando, calculada sem `valor`) e montada no `select` do `useQuery` e lanca um erro proprio (`IncompleteResponseError`): a consulta cai no estado de erro e a tela mostra o erro generico com "Tentar de novo".

Recusa e resultado de negocio, nao falha: nunca a renderize com o componente de erro e nunca a filtre da lista. A grade de metricas tem sete linhas fixas mesmo quando todas sao recusadas.

Os textos de cada motivo, rotulos e unidades estao em `references/textos.md`.

### Erros

- Toda falha vira texto com `describeError(error, { plainText })` de `src/api/errors.ts`, que devolve `{ message, canRetry }` e registra o `instance` do erro desconhecido no console. `plainText: true` so nos endpoints que respondem texto puro (`Players`, `Tournament`). Nunca leia `detail`, `title` ou o corpo em texto para a tela.
- `MESSAGE_BY_CODE` ja tem a tabela inteira de `docs/erros.md`; mensagem nova entra la. Os textos por status estao em `references/textos.md`.
- Mostre o erro com `InlineError` e passe `onRetry` so quando `canRetry` for verdadeiro. A repeticao automatica do `502` (uma vez, 2 s) ja esta no `createQueryClient` de `src/api/queryClient.ts`.
- `401` nao e tratado na tela: o cliente renova a sessao ou leva ao login.
- Validacao que o servidor faria (minimo de pontos do relatorio, moeda da shortlist, limite de acompanhamentos) e checada antes, no formulario. O `422` e rede de seguranca, nao o feedback.

## Estilo

- CSS Modules (`Componente.module.css`, ADR 0005) sobre as variaveis de `src/styles/tokens.css`: `var(--surface)`, `font: var(--text-stat-value)`, `var(--space-4)`. Nenhum valor literal de cor, fonte, espaco ou raio. Se faltar um token, crie-o em `docs/design-system/tokens.json` e rode `npm run gen:tokens`.
- A referencia visual de cada componente esta em `docs/design-system/components/<Nome>/` e em `bundle.css`. Porte o CSS e o comportamento; nao copie o `React.createElement` do `bundle.js`.
- Variantes viram classes combinadas. Valores so conhecidos em execucao, como a cor do clube, entram por custom property inline (`style={{ '--club': cor }}`).
- As regras que mais se erram: `pitch` so como acento (aba, foco, ponto ativo); numeros com `tabular-nums` na familia display; rotulo **embaixo** do valor, sem caixa alta; cartoes sem sombra; sem animacao de entrada; foco com anel de 2px em `pitch`.
- Icones so do Phosphor (`@phosphor-icons/react`, regular, `size={20}`, `currentColor`), importados com o sufixo `Icon` (`CaretDownIcon`, `SignOutIcon`), da lista em `docs/design-system/assets/Icons/`. Icone sozinho so em fechar e arrastar, com `aria-label`.
- Componentes globais ja prontos em `src/components/`: `AppShell` (topo, no `__root`), `PageColumns` (corpo em duas colunas da pagina do jogador), `Card`, `ClubBand`, `Tabs`, `Select`, `Button`, `InlineError` e `Skeleton`. Reuse antes de criar.

## Texto e numeros

- pt-BR, so a primeira letra maiuscula, tratando o olheiro por "voce", sem emoji e sem pedir desculpas.
- Formate com `Intl.NumberFormat('pt-BR')`: `2,10`, `1.284 min`, `86,4%`, `€12,5M`. Toda metrica diz a unidade.
- Botoes dizem a acao ("Acompanhar", "Finalizar relatorio"), sem seta.
- Estado vazio: uma frase do que vai aparecer ali e o botao que preenche a tela, dentro do cartao. Os textos aprovados estao no README do design system.

## Onde cada coisa fica

- Usado por mais de uma tela: `src/components/`, `src/hooks/`, `src/utils/` (funcoes puras) e `src/interfaces/` (tipos).
- Usado por uma tela so: `src/pages/<tela>/components/`, `hooks/`, `utils/` e `interfaces/`, com a pagina na raiz da pasta (`src/pages/metrics/MetricsPage.tsx`).
- O arquivo em `src/routes/` so declara a rota (`validateSearch`) e renderiza a pagina, passando por props o que vem do roteador (`playerId`, `search`, `onSliceChange`). A pagina nao importa a rota, entao as stories da tela rodam sem roteador.
- `new Date()` e outras funcoes impuras nao rodam durante a renderizacao (o lint acusa): fixe com `useState(() => new Date())` e passe a data para as funcoes puras.
- Quando uma segunda tela precisar de algo que esta na pasta de outra, mova para a pasta global em vez de importar de `pages/<outra-tela>/`.
- Tipo de objeto e `interface`; uniao e apelido do contrato (`components['schemas'][...]`) sao `type`.

## Nomes

Todo identificador em ingles, inclusive os do dominio, com o nome de codigo da tabela "Nomes no codigo" do `GLOSSARY.md`: `Slice` (recorte), `SliceSelect`, `MetricsGrid`, `isRefused`, `formatMoney`. Termo novo entra primeiro na tabela do glossario. Ficam em portugues os campos e enums do contrato (`amostraEmMinutos`, `FonteNaoAtribuiu`), os caminhos e search params da URL e os textos da tela.

## Mocks e stories

- Handlers usam o `http` de `src/mocks/http.ts` (`openapi-msw`), tipado pelo contrato: rota, parametros e corpo errados nao compilam.
- Cada handler representa um estado de negocio e tem um nome que o diz (`insufficientSampleMetrics`, `profileSourceDown`). Dado aleatorio nao exercita estado nenhum.
- Handlers nomeados ficam em `src/mocks/handlers/<area>.ts`, fixtures em `src/mocks/fixtures/` (`buildFullProfile`, listas de atributos) e corpos de erro em `src/mocks/responses.ts` (`problem`, `plainText`). `src/mocks/handlers.ts` responde o `dev:mock` por `jogadorId` e tambem e o padrao dos testes.
- Uma story por estado do componente, incluindo carregando, recusa e erro, usando os mesmos handlers aplicados com `beforeEach({ msw }) { msw.use(...) }` (o `parameters.msw` esta obsoleto no addon). A story nao tem handler padrao: declare todos os que a tela chama. Carregamento parado e um handler com `await delay('infinite')`. A story e a especificacao visual da tela.
- Teste de tela vai pela rota: `renderRoute(url)` de `src/test/renderRoute.tsx` monta o roteador com historico em memoria e `retryDelay: 0`; confira a URL em `router.state.location.search` e o historico em `router.history.length`. Para fixar a data, `vi.useFakeTimers({ toFake: ['Date'] })`, que nao trava o MSW.

## Antes de concluir

- `npm run lint`, `npm run typecheck` e `npm test` passam.
- Cada estado da tabela acima tem story ou teste.
- Nenhuma cor, fonte ou espaco literal no CSS; nenhum tipo da API escrito a mao; nenhuma linha recusada escondida; nenhum enum cru (`FonteNaoAtribuiu`) na tela.
- Se a tarefa revelou uma regra que este guia nao cobre, avise o usuario: a skill e atualizada na retrospectiva de cada feature.
