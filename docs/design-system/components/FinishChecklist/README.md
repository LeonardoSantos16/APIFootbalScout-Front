# FinishChecklist

O que falta para finalizar o relatório, sempre visível junto ao botão "Finalizar relatório".

- **O consumidor fornece:** `items` (`label`, `done` e, quando há contagem, `progress` como "1 de 2") e `title` ("Para finalizar" por padrão).
- Não é erro: o pendente fica em `ink-muted` com um anel `line-strong`, e o cumprido em `ink` com o ícone `check`. Nunca `down`, e nada muda de cor antes de o olheiro começar.
- Os mínimos vêm do `ScoutConfig` replicado no front, nunca de literais na tela: "Nota", "Parecer", "2 pontos positivos (1 de 2)", "2 pontos negativos (0 de 2)", "20 caracteres nos pontos (12 de 20)".
- Cada item diz ao leitor de tela se está "cumprido" ou "pendente".
- O botão "Finalizar relatório" fica desabilitado enquanto houver item pendente.
