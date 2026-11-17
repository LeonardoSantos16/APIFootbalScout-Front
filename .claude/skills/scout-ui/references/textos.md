# Textos da interface por valor da API

Valores dos enums do contrato (`src/api/schema.d.ts`) e o texto que o olheiro le. Os numeros entre `<>` vem da resposta; os limites vem do `ScoutConfig` em `docs/README.md` (amostra minima de 450 min).

## Metricas por 90 (`TipoDeAtributoDto`)

| Valor | Rotulo | Unidade |
| --- | --- | --- |
| `Gols` | Gols | por 90 |
| `Assistencias` | Assistências | por 90 |
| `PassesDecisivos` | Passes decisivos | por 90 |
| `Desarmes` | Desarmes | por 90 |
| `Interceptacoes` | Interceptações | por 90 |
| `Rating` | Nota | média |
| `PrecisaoDePasse` | Precisão de passe | % (anexado ao valor) |

Rotulo com unidade: "Desarmes, por 90", "Nota, média". O `%` vai no valor: "86,4%". Contagens e Nota com duas casas ("2,10", "7,12"); Precisão de passe com uma ("86,4%"). A grade tem sempre as sete linhas, nesta ordem.

## Amostra da grade

- Rodape, com a amostra mais comum entre os atributos: "Amostra: 1.284 min jogados. Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor."
- Enquanto carrega, ou sem amostra: so "Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor."
- A linha calculada so mostra a propria amostra quando ela difere do rodape: "1.190 min jogados".

## Recusa de metrica (`MotivoDaRecusaDto`)

| Valor | Texto |
| --- | --- |
| `AmostraInsuficiente` | Amostra insuficiente: `<amostraEmMinutos>` de 450 min |
| `AmostraInsuficiente` sem amostra | Amostra insuficiente: mínimo de 450 min |
| `FonteNaoAtribuiu` | Não publicado pela fonte |

## Tela de metricas por 90

- Seletor: rotulo "Competição e temporada"; opcoes "Brasileirão Série A · 2025", ou "Clube · Brasileirão Série A · 2025" e "Seleção · Eliminatórias Sul-Americanas · 2025" quando o jogador tem algum recorte de seleção. A palavra "recorte" nunca aparece na tela.
- Linha de apoio do cabecalho: "Meio-campo, 27 anos, Atlético Serrano" (posicao pela letra da fonte: G Goleiro, D Defesa, M Meio-campo, F Ataque).
- Perfil sem `stats`: "Sem estatísticas publicadas para este jogador."
- Titulo da aba: "Métricas por 90 · <nome>"; so "Métricas por 90" enquanto carrega ou quando falha.

## Afericao do acompanhamento (`ResultadoDaAfericaoDto`, `MotivoDeIndisponibilidadeDto`)

| Valor | Texto |
| --- | --- |
| `ComMudanca` | `anterior → atual` e chip com sinal e palavra: "+12% valor de mercado", "−340 min" |
| `SemMudancaRelevante` | Sem mudança relevante |
| `Indisponivel` + `MoedaInesperada` | A fonte passou a publicar o valor em outra moeda |
| `Indisponivel` + `TemporadaVirada` | A temporada virou: a minutagem antiga não é comparável |

A janela sempre aparece: "Comparando os últimos `<duracaoEmDias>` dias com a linha de base."

## Comparacao (`ResultadoDaComparacaoDto`, `MotivoDaRecusaDaComparacaoDto`)

| Valor | Texto |
| --- | --- |
| `PosicoesIncompativeis` | `<Posição A>` e `<posição B>` não são comparáveis. |
| `PosicaoDesconhecida` | A fonte não informou a posição de um dos jogadores. |
| `RecorteDivergente` | Os dados dos dois jogadores não são da mesma competição e temporada. |
| `AmostraInsuficiente` | Minutos jogados insuficientes para comparar. |

`jogadores` vem mesmo na recusa: mostre nome e posicao dos dois. Atributo recusado para um lado fica vazio com o motivo e nao tem "vencedor".

## Posicao (`PosicaoDto`)

`Goleiro` → Goleiro · `Defesa` → Defesa · `MeioCampo` → Meio-campo · `Ataque` → Ataque

Compativeis: cada uma consigo mesma, e `MeioCampo` com `Defesa` e com `Ataque`.

## Relatorio (`StatusRelatorioDto`, `ParecerDto`)

Status: `Rascunho` → Rascunho · `Finalizado` → Finalizado

Parecer: `Contratar` → Contratar · `Monitorar` → Monitorar · `Reavaliar` → Reavaliar · `Descartar` → Descartar

## Contexto do recorte (`ContextoDeRecorteDto`)

`Clube` → Clube · `Selecao` → Seleção

## Erros

O texto final de cada `code` esta em `MESSAGE_BY_CODE` (`src/api/errors.ts`): a tabela de `docs/erros.md` em pt-BR com acentos e sem a palavra "recorte". Quando os dois divergem, vale o modulo.

Sem `code`, nos endpoints de texto puro (`Players`, `Tournament`), com `describeError(error, { plainText: true })`:

| Status | Texto |
| --- | --- |
| `404` | Jogador não encontrado. |
| `502` | Não foi possível carregar o perfil agora. |
| outros | Não foi possível concluir agora. |

Erro desconhecido (sem `code` num endpoint de `ProblemDetails`, `code` interno ou desconhecido, falha de rede, resposta incompleta): "Não foi possível concluir agora."

"Tentar de novo" aparece no `502` e no erro desconhecido, nunca num `4xx`.

## Sessao e conta

| Situacao | Texto |
| --- | --- |
| Aviso `sessao-expirada` (e `usuario.refresh_token_invalido`) | Sua sessão expirou. Entre novamente. |
| Aviso `sessao-invalida` (`usuario.token_sem_identificacao`) | Sessão inválida. Entre novamente. |
| Aviso `conta-excluida` | Conta excluída. |
| Senha trocada | Senha alterada. As outras sessões encerram em até 15 minutos. |
| Dica da senha nova | De 8 a 72 caracteres. |
| E-mail invalido | Informe um e-mail válido. |
| Senha vazia na entrada | Informe a senha. |
| Senha atual vazia | Informe a senha atual. |
| Nome fora do limite | O nome precisa ter de 2 a 120 caracteres. |
| Senha fora do limite | A senha precisa ter de 8 a 72 caracteres. |
| Confirmacao diferente | As senhas não conferem. |

Erros de servidor com campo: `usuario.email_ja_cadastrado` no E-mail, `usuario.credenciais_invalidas` na Senha, `usuario.senha_atual_invalida` na Senha atual, `usuario.senha_igual_a_atual` na Nova senha. "Cadastro" nao aparece na tela: e "Criar conta".
