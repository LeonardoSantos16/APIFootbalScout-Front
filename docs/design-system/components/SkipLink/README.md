# SkipLink

Link "Pular para o conteúdo", o primeiro item focável de toda página do olheiro.

- **O consumidor fornece:** `href`, o id do `main` (padrão `#conteudo`). O texto é sempre "Pular para o conteúdo".
- Fica fora da tela até receber o foco pelo teclado; com o foco, aparece no canto superior esquerdo, por cima do topo.
- Pílula branca com texto `on-light` em `body-strong`, 44px de altura, com o anel de foco em `pitch`.
- O `main` de destino tem `tabIndex={-1}`, para o foco ir até ele e o próximo Tab seguir dali.
