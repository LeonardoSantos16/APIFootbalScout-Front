# Grilling: Navegacao e acessibilidade

Decisoes fechadas no grilling do item 9 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `navegacao` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md).

## Fatos do contrato e do codigo

Conferidos antes do grilling, mudam as respostas abaixo:

- So a shortlist tem lista do olheiro (`GET /api/Shortlist`). Acompanhamentos nao tem lista (item 6b), e relatorios so se listam por jogador (`GET /api/Relatorio/jogador/{jogadorId}`).
- O topo tem "Acompanhamentos" e "Relatórios" como texto sem destino, e o botao "Menu" do celular nao abre nada.
- `/` e a pagina inicial provisoria da busca e perfil (Q13 de [busca-e-perfil.md](busca-e-perfil.md)): "Olá, {nome}." e o campo de busca.
- Nao ha rota de pagina inexistente. A rota do jogador converte o id com `Number(jogadorId)`, sem validar.
- `relatorioId` e `shortlistId` sao `uuid` no contrato; o `jogadorId` do back-end e `int:min(1)`.
- Os titulos sao "<Página> · <jogador>", sem o nome do app; o roteador nao tem `scrollRestoration`.

## Nome e escopo

- **Q1.** Change `navegacao` (sem identificador do back-end), branch `feat/navegacao`, delta da capability `navegacao`. Entram os destinos do topo e o estado ativo, o menu do celular, a pagina inicial definitiva, a rota inexistente e a revisao de acessibilidade e responsivo. Fora: tema claro e PWA. A revisao com `web-design-guidelines` corrige nesta change o que e da navegacao e da casca; o que e de uma tela e pede mais que um ajuste pontual vai para `divida-tecnica.md`.

## Topo

- **Q2. Links sem lista:** "Acompanhamentos" e "Relatórios" saem do topo, que fica com a busca, "Shortlists", o nome do olheiro e "Sair". "Acompanhamentos" volta no item 6b; a falta de uma lista dos relatorios do olheiro vai para a divida tecnica.
- **Q6. Nome do app e estado ativo:** o nome do app e link para `/`, sem marca de atual. Marcados como atuais: "Shortlists" em `/shortlists` e em toda shortlist, e o nome do olheiro em `/conta`. No menu do celular, a mesma regra com `aria-current`. A busca nao ganha marca, porque o campo some em `/busca`.

## Celular

- **Q4. Menu:** "Menu" abre um `Dialog` do Radix como painel de tela cheia, que prende o foco, fecha com o `x`, Esc e ao navegar e devolve o foco ao botao. "Buscar" continua fora do menu, ao lado do botao.
- **Q11. Conteudo do menu:** titulo "Menu" e, em ordem, "Início", "Shortlists", o nome do olheiro (para `/conta`) e "Sair" (`Button` ghost com `sign-out`). Cada link tem 44px de altura e `aria-current` na rota atual.

## Pagina inicial

- **Q3.** `/` mostra "Olá, {nome}.", a busca e o cartao "Suas shortlists" com as shortlists de `GET /api/Shortlist`. "Vistos recentemente" fica de fora: criaria estado local novo fora da sessao.
- **Q9. Cartao "Suas shortlists":** mesma ordem por nome de `/shortlists` (reaproveita `useShortlists`), no maximo 5, com "Ver todas as shortlists" para `/shortlists` quando ha mais. Cada linha: o nome como link e "n alvos" com o custo total, como na lista. Carregando: skeleton de 3 linhas. Vazio: "Você ainda não tem shortlists." com o link "Criar shortlist" para `/shortlists`. Erro: `InlineError` dentro do cartao, com "Tentar de novo" no 502; a busca continua funcionando. Nao cria shortlist na pagina inicial.
- **Q10. Layout:** uma coluna, com a saudacao e a busca em cima e as shortlists embaixo, sem coluna de apoio.

## Rota inexistente

- **Q5.** `notFoundComponent` na raiz. Com sessao, dentro do `AppShell`: "Página não encontrada." e o link "Ir para o início". Sem sessao, no `AuthShell`, com o link "Entrar". Titulo "Página não encontrada · APIFootballScout". Os "nao encontrado" por recurso (shortlist, relatorio, jogador) continuam como estao.
- **Q14. Parametro invalido:** `$jogadorId` que nao e inteiro maior ou igual a 1 (`abc`, `0`, `-3`) e `$relatorioId` ou `$shortlistId` que nao sao `uuid` caem na pagina do Q5 pela validacao do parametro na rota, sem chamar a API.

## Acessibilidade

- **Q7.** Entram o link "Pular para o conteúdo" (primeiro focavel, visivel so no foco), o foco no `h1` na troca de rota, o padrao de titulo "<Página> · APIFootballScout" e alvo de toque de 44px no topo do celular.
- **Q12. Foco na troca de rota:** o foco vai para o `h1` da pagina (`tabIndex={-1}`) quando o `pathname` muda, exceto no primeiro carregamento, na troca de aba dentro do mesmo jogador (o foco fica no link da aba) e nas mudancas so de search params (recorte, `com`, `termo`). O "Pular para o conteúdo" leva ao `main`, tambem com `tabIndex={-1}`. Sem regiao `aria-live` propria: o anuncio vem do titulo.
- **Q13. Titulos:** um hook `useDocumentTitle(...parts)` junta as partes com " · " e poe "APIFootballScout" no fim ("Métricas · Rafael Souza · APIFootballScout"); a pagina inicial e so "APIFootballScout". Toda tela troca o `document.title` direto pelo hook.
- **Q16. Rolagem:** `scrollRestoration` do TanStack Router. Rota nova comeca no topo; voltar e avancar do navegador restauram a posicao; troca de aba do jogador e mudanca so de search params mantem a rolagem.

## Responsivo

- **Q8.** Um ponto de quebra so, 720px. A conferencia passa por todas as telas em 375px e 768px, e o que quebrar em 768px se corrige dentro do layout atual.

## Wireframe e design system

- **Q15.** Wireframes da pagina inicial (carregando, com shortlists, com mais de 5, vazia, erro; desktop e 375px), do menu do celular aberto e da rota inexistente com e sem sessao. Entram antes no design system o `SkipLink` e a variante de painel de tela cheia do `Dialog` para o menu; o resto reaproveita componentes existentes.
