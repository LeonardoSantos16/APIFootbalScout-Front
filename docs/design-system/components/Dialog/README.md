# Dialog

Diálogo modal para confirmar uma ação irreversível. O primeiro uso é a exclusão da conta.

- **O consumidor fornece:** `open`, `title`, `description`, `onClose`, o conteúdo como `children` (por exemplo um `TextField` de confirmação) e `actions` com os botões.
- Em produção é o Radix Dialog: foco preso dentro, `Esc` e o `x` fecham, o foco volta para o botão que abriu. Esta referência só mostra a aparência.
- `surface` com borda `line` e `radius-lg` sobre fundo preto translúcido, centralizado, com no máximo 440px. Título em `section-title`, descrição em `ink-soft`.
- Fechar é o `x` com `aria-label="Fechar"`, um dos dois lugares onde ícone sozinho vale.
- Botões à direita: "Cancelar" `secondary` e a ação `primary`. Abaixo de 480px, empilhados com a ação em cima.
- Ação irreversível fica desabilitada até a confirmação: na exclusão, até o olheiro digitar o próprio e-mail.
