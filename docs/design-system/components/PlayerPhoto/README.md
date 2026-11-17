# PlayerPhoto

Foto redonda do jogador, com as iniciais no lugar quando a imagem não vem ou falha ao carregar.

- **O consumidor fornece:** `name` (vira o texto alternativo e as iniciais), `src` com `playerImage` do perfil e `size`.
- `size: 'band'` (72px, 56px no celular) vai dentro da `ClubBand`; `size: 'small'` (40px) fica para listas.
- As iniciais são a primeira letra do primeiro e do último nome, em Archivo, sobre `surface-strong`.
- A imagem vem direto da fonte e pode ser bloqueada fora do site dela: o `onError` troca pela inicial sem deixar ícone de imagem quebrada.
- Sem borda nem sombra; a faixa do clube já dá o contraste.
