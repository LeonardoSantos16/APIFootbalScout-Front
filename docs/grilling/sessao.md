# Grilling: Sessao

Decisoes fechadas no grilling do item 3 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `sessao` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md).

## Fatos do contrato e do back-end

Conferidos antes do grilling, mudam as respostas abaixo:

- `GET /api/Auth/me` devolve `userId`, `email` e `roles`, sem `name`. O nome so vem no `AuthResponseDto` (signup, signin, refresh, change-password).
- `usuario.senha_atual_invalida` sai como `ValorInvalidoException`, que o `ExceptionHandlerGlobal` responde com 400, nao 401. Nunca passa pelo refresh.
- `usuario.nao_encontrado` em `change-password` sai como `NaoAutenticadoException` (401).
- Trocar a senha e `signout-all` revogam so os refresh tokens. O `sec_stamp` vai no JWT mas nao e conferido: as outras sessoes seguem validas ate o access token vencer (ate 15 min).
- `DELETE /api/Auth/me` nao pede senha nem corpo.
- `POST /api/Auth/signup` responde `201` ja com o par de tokens.
- Limites: nome de 2 a 120 caracteres, e-mail ate 254, senha de 8 a 72.

## Nome

- **Q1.** Change `sessao`, branch `feat/sessao`, capability `sessao`. Sem identificador: o `features.md` do back-end so numera as features de dominio.

## Renovacao

- **Q2. So reativa** (ADR 0002): o primeiro `401` dispara o refresh. Excecao sem timer: se `accessTokenExpiresAtUtc` ja passou quando a requisicao vai sair, renova antes de enviar. O escopo do item 3 no planejamento dizia "proativa" e foi corrigido.
- **Q3. Duas abas:** o refresh roda dentro de `navigator.locks` e rele o token ao obter o lock (ADR 0002). O evento `storage` so trata o par sumindo (a aba limpa o estado e vai ao login) ou trocando de conta (a aba recarrega, para nao misturar o cache do React Query). A rotacao nao precisa de evento: a proxima requisicao ja le o `localStorage`.
- **Q17. Sem `navigator.locks`** (jsdom, navegadores antigos): o lock entra por parametro no modulo de refresh. Sem `locks`, vale a fila em memoria da aba, aceitando a corrida entre abas. Nos testes, fila em memoria e um lock falso para o cenario "outra aba ja renovou".
- **Q4. Refresh falhou com fila:** com `401`, todas as requisicoes da fila falham juntas, a sessao e limpa uma vez, o cache do `QueryClient` e zerado e o olheiro vai para `/entrar?redirecionar=<rota atual>` com "Sua sessão expirou. Entre novamente." (a mensagem do `code`, ou essa mesma sem `code`). Erro de rede ou 502 no refresh nao derruba a sessao: as requisicoes falham com o erro de sempre e o par continua guardado.

## Armazenamento e boot

- **Q5.** Par de tokens, `name` e `email` num modulo unico (ADR 0001), atualizados a cada `AuthResponseDto`. O header le o nome guardado; o `me` so confirma o token.
- **Q6. Boot:** a rota de layout protegida espera o `me` no `beforeLoad`, com o header em skeleton e o corpo vazio, sem splash. `401` no `me` passa pelo refresh normal. Sem par guardado, ou com `refreshTokenExpiresAtUtc` vencido, vai direto ao login sem chamar a API.

## Rotas

- **Q7, Q14.** Publicas: `/entrar` e `/criar-conta`, so com a marca (sem o `AppShell` completo). O resto fica sob a rota de layout `_autenticado`. Destino em `?redirecionar=` (caminho e query), aceito so se comecar com `/` e nao com `//`; sem destino, `/`. Quem ja esta logado e abre `/entrar` ou `/criar-conta` vai para `/`. Conta em `/conta`.
- **Q16. Pagina inicial provisoria:** `/` dentro do `AppShell` com "Olá, {nome}." e um texto curto dizendo que a busca chega em breve; no `dev:mock`, links para as metricas dos jogadores 1001 a 1005. O item 9 substitui.
- **Q19. Titulos da aba:** "Entrar", "Criar conta", "Conta"; `/` fica "APIFootballScout".

## Formularios

- **Q8. Criar conta:** entra direto e vai para o destino ou `/`. E-mail ja usado (409) aparece no campo de e-mail com a mensagem do `code`.
- **Q9. Validacao:** os limites do contrato e e-mail com `@`, checados no envio e, depois disso, a cada mudanca do campo que errou. Nada aparece antes da primeira tentativa. Erro do servidor vai no campo dele quando existe (credenciais invalidas, senha atual errada, e-mail ja usado); senao, `InlineError` acima do botao. Sem biblioteca de formulario.
- **Q11. Troca de senha:** campos senha atual, nova senha e confirmacao (so do front). O par novo substitui o antigo e a sessao atual continua; o formulario e limpo e aparece "Senha alterada. As outras sessões encerram em até 15 minutos."

## Sair e excluir

- **Q10. Sair:** "Sair" no header encerra esta sessao (`signout` com o refresh token). "Sair de todos os dispositivos" fica em `/conta`, com o aviso "As outras sessões encerram em até 15 minutos." Nos dois, o estado local e limpo mesmo se a chamada falhar, sem esperar a resposta para navegar.
- **Q12. Excluir conta:** `Dialog` que avisa que relatorios, shortlists e acompanhamentos somem e so habilita "Excluir conta" quando o olheiro digita o proprio e-mail (a API nao pede senha). Depois do `204`, limpa o estado e vai para `/entrar` com "Conta excluída."

## Design system e glossario

- **Q15.** Entram antes no design system: `TextField` (rotulo em cima, erro embaixo ligado por `aria-describedby`, tokens do `Select`), `PasswordField` (o `TextField` com o botao de texto "Mostrar"/"Ocultar", sem os icones `eye`, ja que icone sozinho so em fechar e arrastar) e `Dialog` (Radix Dialog, com `x` para fechar; primeira dependencia do Radix). O header troca o placeholder pelo nome do olheiro como link para `/conta` e "Sair" como `Button` ghost, sem menu suspenso.
- **Q14. Glossario:** entram **Conta** (`account`) e **Sessao** (`session`). "Cadastro" continua proibido, por ser sinonimo a evitar de perfil. Paginas: `SignInPage`, `SignUpPage`, `AccountPage`.

## Mocks e testes

- **Q13. Mocks:** handlers de `/api/Auth` com usuario em memoria e tokens opacos (`mock-access-1`, `-2`...); o access token vence por contador de uso, para exercitar o `401`. O `dev:mock` comeca logado com um usuario fixo (par semeado no `localStorage`). Os handlers das outras areas exigem `Authorization` e respondem `401` sem ele. O `renderRoute` ganha a opcao de sessao, logado por padrao.
- **Q20. Testes:**
  - Unitarios: armazenamento do par (ler, gravar, limpar, `name`/`email`), validacao do `redirecionar`, validacao dos formularios e a fila de refresh com fetch falso (N requisicoes concorrentes geram um refresh so; refresh falho derruba todas; repeticao com `401` nao renova de novo; 502 no refresh mantem o par; token vencido localmente renova antes de enviar).
  - Rota (RTL + MSW): entrar com destino preservado, credenciais invalidas no campo, criar conta com e-mail ja usado, rota protegida sem sessao, `401` no meio das metricas renovando e repetindo, sessao expirada voltando ao login com aviso, sair, sair de todos, troca de senha (sucesso, atual errada, igual a atual) e exclusao com o e-mail digitado.
  - Stories por componente e por estado de cada formulario.
- **Q21.** Nesta change o Claude escreve os testes e o green, inclusive o da fila de refresh. A fila fica num grupo proprio do `tasks.md`.
- **Pendencia herdada da F9:** conferir com dados reais a regra de contexto do recorte (`stats[i].team.id` em `nationalTeamStats`), que a F9 deixou como primeira tarefa deste item.

## Docs

- **Q18.** `erros.md` local corrigido (`usuario.senha_atual_invalida` responde 400, `usuario.nao_encontrado` 401). Na divida tecnica: `name` no `me`, `sec_stamp` nao conferido, a divergencia do `erros.md` do back-end e a home provisoria.

## Wireframe

Estados a desenhar, em desktop e em 375px:

- `/entrar`: vazio, erro de validacao, credenciais invalidas, enviando, sessao expirada, conta excluida.
- `/criar-conta`: vazio, erros de validacao, e-mail ja usado, enviando.
- `/conta`: troca de senha (vazio, atual errada, igual a atual, sucesso), sair de todos, `Dialog` de exclusao desabilitado e habilitado.
- Boot com o header em skeleton.
- `/` provisoria.
