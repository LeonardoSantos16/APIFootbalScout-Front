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
| `Rating` | Rating | média |
| `PrecisaoDePasse` | Precisão de passe | % (anexado ao valor) |

Rotulo com unidade: "Desarmes, por 90", "Rating, média". O `%` vai no valor: "86,4%".

## Recusa de metrica (`MotivoDaRecusaDto`)

| Valor | Texto |
| --- | --- |
| `AmostraInsuficiente` | Amostra insuficiente: `<amostraEmMinutos>` de 450 min |
| `FonteNaoAtribuiu` | Não publicado pela fonte |

Metrica calculada: o valor, com `amostraEmMinutos` como contexto ("Calculado sobre 1.284 min jogados").

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

## Erros sem `code`

A mensagem por `code` esta em `docs/erros.md`. Sem `code`, ou com corpo em texto puro:

| Status | Texto |
| --- | --- |
| `502` | Não foi possível falar com a fonte de dados agora. Tente de novo. |
| `404` | Não encontramos o que você procurava. |
| outros | Algo deu errado. Tente de novo. |
