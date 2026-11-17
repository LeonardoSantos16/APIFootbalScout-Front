# Select

Campo de escolha única com rótulo, usado para a competição e temporada das telas de análise.

- **O consumidor fornece:** `label`, `options` (`value` e `label` de cada opção, já na ordem final), `value`, `onChange` e `loading` enquanto as opções não chegaram.
- É um `<select>` nativo com `color-scheme: dark`: teclado, leitor de tela e celular funcionam como o navegador manda. A lista aberta segue o estilo do sistema operacional.
- Pílula em `surface-raised` com borda `line-strong`, seta `caret-down` em `ink-muted` e foco com anel de 2px em `pitch`. Rótulo em `label`, `ink-muted`, em cima do campo.
- O select não quebra linha: no celular o fim do texto é cortado. Ponha a parte que diferencia as opções no começo ("Seleção · Eliminatórias Sul-Americanas · 2025").
- Carregando, o campo vira um skeleton pílula da mesma altura e o rótulo continua.
- No seletor de recorte, o termo "recorte" não aparece: o rótulo é "Competição e temporada".
