# PointList

Lista editável de frases curtas, usada nos pontos positivos e nos pontos negativos do relatório.

- **O consumidor fornece:** `label`, `items` (a lista inteira), `onChange` com a lista inteira nova, `count` ("1 de 2"), `placeholder`, `addLabel`, `disabled` e, na leitura, `readOnly` e `emptyText`.
- Cada ponto é um campo de uma linha na moldura do `TextField`, com "Remover" em texto dentro dele, como o "Mostrar" do `PasswordField`. "Adicionar ponto" é um botão `ghost` com o ícone `plus` no fim da lista.
- O componente não limpa nem descarta nada: quem consome tira os espaços das pontas e descarta os pontos vazios antes de enviar.
- `count` fica à direita do rótulo, em `ink-muted`, com `tabular-nums`.
- Sem ordem nem arrastar. Na leitura, uma lista com marcadores em `ink`; vazia, `emptyText` em `ink-subtle`.
