# SegmentedControl

Escolha única entre poucas opções curtas, lado a lado, usada no parecer do relatório.

- **O consumidor fornece:** `label`, `options` (`value` e `label`, na ordem final), `value` (ou nada, antes da primeira escolha), `onChange`, `disabled` e `error`.
- É um grupo de `radio` nativo dentro de um `fieldset` com `legend`: as setas trocam a opção e o leitor de tela anuncia o grupo.
- Trilho pílula em `surface-raised` com borda `line-strong`; o segmento escolhido fica em `surface-strong` e `ink`, com o ponto de estado ativo em `pitch` antes do texto. Os demais em `ink-soft`.
- Sem cor por opção: "Contratar" não é verde e "Descartar" não é vermelho. O significado está na palavra.
- Até 480px, os segmentos quebram em duas colunas.
- Para mais de quatro opções ou textos longos, use o `Select`.
