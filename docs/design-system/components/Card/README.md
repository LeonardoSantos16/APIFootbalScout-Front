# Card

Contêiner `surface` com cantos `radius-lg` que agrupa um bloco de conteúdo da página: perfil, métricas, carreira, shortlist.

- **O consumidor fornece:** `children`; opcionalmente `title` e `subtitle`, `aside` (ações no canto do título), `header` (por exemplo uma `ClubBand`), `footer` (amostra, fonte, data) e `flush` para conteúdo que vai até a borda, como listas.
- Sem sombra e sem borda: a elevação é o degrau de `ground` para `surface`.
- Não aninhe cartões; dentro de um cartão use linhas `line` ou painéis `surface-raised`.
