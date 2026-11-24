# ReportTimeline

A linha do tempo dos relatórios de um jogador: cada grupo é um relatório original seguido das correções dele.

- **O consumidor fornece:** `groups`, cada um com `id`, `label` (para o leitor de tela: "Relatório observado em 24/11/2026") e `items` na ordem da cadeia, com o original primeiro. Cada item tem `id`, `title`, `detail`, `note` opcional, `status` (`draft`, `finalized` ou `current`) e `href`.
- Quem agrupa e ordena é o consumidor: os grupos pela raiz, do mais recente para o mais antigo pela data da observação; dentro do grupo, pela data de escrita.
- Cada linha segue a `RowList`: link inteiro, `title` ("Observado em 24/11/2026", "Correção de 26/11/2026"), `detail` ("7,5 de 10 · Contratar", "Sem nota · Sem parecer") e o `StatusBadge` à direita. O rascunho mostra também "Continuar".
- As correções entram recuadas, com um conector em `line-strong` ligando cada uma à anterior. `note` leva "Corrigido por relatório de 26/11/2026" em `ink-muted`.
- Grupos separados por `line`. Abaixo de 720px, a etiqueta desce para baixo do texto.
- Coloque dentro de um `Card`.
