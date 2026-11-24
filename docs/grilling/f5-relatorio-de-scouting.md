# Grilling: F5 Relatorio de scouting

Decisoes fechadas no grilling do item 7 de [planejamento-base.md](../planejamento-base.md). Sao a entrada do wireframe e da change `f5-relatorio-de-scouting` no OpenSpec. Pendencias da API em [divida-tecnica.md](../divida-tecnica.md); a concorrencia otimista no [ADR 0006](../adr/0006-escritas-com-if-match.md).

## Fatos do contrato e do back-end

Conferidos antes do grilling, mudam as respostas abaixo:

- `POST /api/Relatorio` exige `texto` (`[Required]`: vazio ou so espacos responde `400` de validacao, sem `code`) e `observadoEm`. Nao existe rascunho vazio.
- `observadoEm` so e definido na abertura: o `PUT /{id}` nao tem o campo, e a correcao herda a data do original.
- No `PUT`, `null` e "nao mexe": nota e parecer, uma vez definidos, nao voltam a vazio; os pontos voltam a `[]`; o texto nao pode ficar vazio (`relatorio.texto_obrigatorio`). As listas de pontos sao substituidas por inteiro.
- Concorrencia otimista (ADR 0005 do back-end): `PUT /{id}` e `PUT /{id}/finalizar` exigem `If-Match: "<version>"`; sem o header, `428`; com versao velha, `412 relatorio.alterado_por_outra_requisicao`. A `version` vem tambem no corpo, inclusive nos itens da listagem.
- Finalizar nao tem corpo e sobrescreve `escritoEm` com a hora da finalizacao.
- Correcao: so de finalizado (`409 relatorio.correcao_de_rascunho`), exige `texto`, sem `If-Match`. Uma correcao pode ser corrigida, e nada impede duas correcoes do mesmo original.
- `GET /api/Relatorio/jogador/{jogadorId}` vem ordenado por `observadoEm` decrescente.
- Nao ha exclusao de rascunho. O `jogadorId` nao e conferido na fonte (so `> 0`), e nenhum endpoint do relatorio passa pelo SofaScore.
- Conteudo minimo (`ScoutConfig`): 2 pontos positivos, 2 negativos e 20 caracteres somados nos pontos, sem trim no servidor. Nota de 0 a 10 com uma casa decimal.

## Nome e escopo

- **Q1.** Change `f5-relatorio-de-scouting`, branch `feat/f5-relatorio-de-scouting`, capability `relatorio-de-scouting`. Entram abrir, editar, finalizar, corrigir e a linha do tempo por jogador. Fora: relatorio de partida, exportacao em PDF e lista global "meus relatorios" (o contrato so lista por jogador).

## Onde mora

- **Q2.** Aba "Relatórios" no `PlayerLayout`, a ultima: "Perfil | Métricas | Comparação | Acompanhamento | Relatórios". A aba (`/jogadores/$jogadorId/relatorios`) tem a linha do tempo e "Novo relatório"; o editor e a leitura ficam em `/jogadores/$jogadorId/relatorios/$relatorioId`.
- **Q26.** Relatorio ainda nao salvo: `/jogadores/$jogadorId/relatorios/novo`; correcao nova: `/jogadores/$jogadorId/relatorios/novo?corrige=<relatorioId>`, que carrega o original para preencher relato e data. Depois do primeiro salvar, navega com `replace` para `/relatorios/$relatorioId`.
- **Q25.** A area de acoes do perfil segue escondida; o perfil nao mostra nada dos relatorios (fica para o item 9).

## Editor

- **Q3. Como o rascunho nasce:** "Novo relatório" abre o editor local completo (data, relato, nota, parecer, pontos). O primeiro "Salvar rascunho" faz o `POST` (texto e data) e, se houver mais campos, um `PUT` em seguida com a `version` recebida.
- **Q4. Salvar:** botao "Salvar rascunho", com o aviso "Alterações não salvas" enquanto o estado local diferir do salvo. Uma escrita em voo por vez: o botao fica desabilitado ate a resposta. "Finalizar" salva antes, se houver mudanca, e finaliza com a `version` nova.
- **Q5. Data da observacao:** padrao hoje, so a data (`input type="date"` com `max` = hoje no fuso local). Envia meia-noite local com offset (`2026-11-24T00:00:00-03:00`) e mostra "24/11/2026". Depois do primeiro salvar fica somente leitura, com a dica "A data da observação não muda depois de salvar." O `409 relatorio.observacao_futura` e rede de seguranca.
- **Q6. Relato:** rotulo "Relato" para o `texto`, `textarea` obrigatorio; termo novo no `GLOSSARY.md` ("observações" a evitar, porque observacao e o ato de assistir). Vazio ou so espacos: "Escreva o relato.", o que tambem evita o `400` sem `code`.
- **Q7. Nota:** campo de texto com `inputmode="decimal"`, aceita virgula ("7,5"), validado no cliente com as mensagens de `nota.fora_da_faixa` e `nota.precisao_invalida`. Leitura "7,5 de 10". Sem "limpar nota" depois de salva.
- **Q8. Parecer:** radio group segmentado "Contratar", "Monitorar", "Reavaliar", "Descartar", sem cor por parecer; `pitch` so no selecionado. Escolhido, nao volta a vazio.
- **Q9. Pontos:** duas listas, um campo de uma linha por item com "Remover" e "Adicionar ponto" no fim. O estado local guarda a lista inteira e o `PUT` envia inteira. Itens vazios ou so com espacos sao descartados e cada item vai com trim; a contagem dos 20 caracteres usa os itens limpos. Sem ordem nem arrastar.
- **Q10. O que falta para finalizar:** checklist neutro, sempre visivel junto ao "Finalizar": "Nota", "Parecer", "2 pontos positivos (1 de 2)", "2 pontos negativos (0 de 2)", "20 caracteres nos pontos (12 de 20)". Cumprido com o icone de check, pendente em `ink-muted`, nunca vermelho. "Finalizar" desabilitado ate tudo cumprido. Os minimos vem de `src/config/scout.ts`. Os `422` do servidor aparecem num `Notice` com o texto do `erros.md`.
- **Q11. Confirmar a finalizacao:** `Dialog` "Finalizar relatório?" / "Depois de finalizado, o relatório não muda mais. Para ajustar, crie uma correção." / "Finalizar" e "Voltar".
- **Q27. Layout:** no desktop, `PageColumns`: campos a esquerda (data, relato, nota, parecer, pontos positivos, pontos negativos) e, na coluna de apoio, o checklist, "Salvar rascunho" e "Finalizar". Em 375px, uma coluna, com checklist e botoes no fim do formulario, sem rodape fixo.

## Falhas e concorrencia

- **Q15. `412`:** as edicoes locais ficam e um `Notice` acima do botao diz "Este relatório foi alterado em outra aba." com "Carregar a versão atual", que refaz o `GET` e descarta as edicoes locais. Salvar e finalizar ficam desabilitados ate isso. `409 relatorio.ja_finalizado`: refaz o `GET`, mostra a leitura do finalizado e o `Notice` "Este relatório já foi finalizado.".
- **Q16. ADR 0006:** `If-Match` montado com a `version` do corpo da ultima resposta; uma escrita em voo por vez; no `412` o servidor vence, sem merge. A resposta de cada escrita substitui o estado salvo, como no ADR 0004.
- **Q17. `POST` ok e `PUT` seguinte com falha:** navega para `/relatorios/$relatorioId` mantendo os campos nao salvos, com "Alterações não salvas" e o erro junto ao botao; o proximo salvar manda so o `PUT`.
- **Q18. Sair com alteracoes nao salvas:** `useBlocker` do TanStack Router com `Dialog` "Sair sem salvar?" / "As alterações deste relatório serão perdidas." / "Sair" e "Continuar editando"; `beforeunload` nativo para fechar ou recarregar a janela.

## Finalizado e correcao

- **Q12. Correcao:** "Criar correção" abre o editor local com o relato do original preenchido e editavel; nota, parecer e pontos vazios (o olheiro reavalia). A data vem do original, somente leitura. O `POST /correcoes` sai no primeiro salvar. O editor mostra "Corrige o relatório de 24/11/2026" com link para o original; titulo "Correção".
- **Q19. Leitura do finalizado:** relato, "7,5 de 10", parecer, as duas listas e "Observado em 24/11/2026 · finalizado em 25/11/2026". "Criar correção" so no vigente do grupo, para a cadeia ficar linear; se ja existe uma correcao em rascunho dele, o botao vira "Continuar correção". Os nao vigentes mostram "Corrigido por relatório de 26/11/2026", com link.
- **Q20.** Varios rascunhos do mesmo jogador sao permitidos (R5.6), sem aviso.

## Linha do tempo

- **Q13. Agrupamento:** grupos pela raiz (subindo por `corrigeRelatorioId` ate o relatorio sem ele), ordenados por `observadoEm` decrescente. Dentro do grupo, por `escritoEm` crescente, com a cadeia inteira; o finalizado mais recente do grupo e o "Vigente". Um `corrigeRelatorioId` que nao esta na lista vira raiz.
- **Q14. Rascunho sem exclusao:** aceito e registrado na divida tecnica. Na linha do tempo, o rascunho aparece com "Rascunho" e o link "Continuar".

## Cache

- **Q21.** Lista por jogador e relatorio por id com `staleTime` de 1 min. A resposta de cada `POST`/`PUT` entra com `setQueryData` no relatorio por id e invalida a lista do jogador. Vindo da lista, o editor usa o item como `initialData`.

## Textos e estados

- **Q22.**
  - Aba "Relatórios", titulo da pagina "Relatórios"; editor "Relatório", ou "Correção" quando tem `corrigeRelatorioId`.
  - Carregando: skeleton de tres linhas da linha do tempo; no editor, skeleton dos campos.
  - Vazio: "Você ainda não escreveu relatórios sobre este jogador." e "Novo relatório".
  - Linha da linha do tempo: "Observado em 24/11/2026", status ("Rascunho", "Finalizado", "Vigente"), "7,5 de 10" e o parecer, ou "Sem nota" e "Sem parecer" no rascunho.
  - Erro: `describeError`. No editor, `404 relatorio.nao_encontrado` mostra "Relatório não encontrado." com "Voltar aos relatórios". Sem "Tentar de novo" proprio do 502 (o relatorio nao passa pelo SofaScore), so o generico.
  - Botoes: "Salvar rascunho" / "Salvando…"; "Finalizar" / "Finalizando…".

## Design system e componentes

- **Q23.** Componentes novos entram antes no design system (README, `bundle.css`/`bundle.js`) e no artefato, antes da spec. Em `src/components/`: `TextArea`, `DateField`, `SegmentedControl` (parecer) e `StatusBadge`. Em `src/pages/report/components/`: `PointList`, `FinishChecklist` e `ReportTimeline` (sobre o `RowList`).

## Mock

- **Q24.** Relatorios em `src/mocks/reportStore.ts` (zerado a cada teste, como o `trackingStore`), com `version` e as regras do dominio replicadas (`412` com versao divergente, `409` no finalizado, `422` no conteudo minimo, `428` sem `If-Match`):
  - 1001: cadeia completa (original finalizado, correcao finalizada vigente, correcao da correcao em rascunho) e um rascunho solto.
  - 1002: um finalizado vigente, para "Criar correção".
  - 1003: sem relatorios.
  - 1005: rascunho cujo `PUT` sempre responde `412`.
  - 1007: listagem com `500`.

## Glossario

- **Q28.** Termos novos: "Relato" e "Vigente". Nomes no codigo seguem a tabela do `GLOSSARY.md`, que ja fixa Nota como `rating`: Relatório `Report`, Rascunho `draft`, Finalizado `finalized`, Correção `Correction`, Parecer `verdict`, Relato `narrative`, Pontos positivos e negativos `positivePoints` e `negativePoints`, Vigente `current`, Observação `observation`.
