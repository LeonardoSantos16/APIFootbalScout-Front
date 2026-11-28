# Dialog

Diálogo modal. Centralizado, confirma uma ação irreversível (o primeiro uso é a exclusão da conta); em tela cheia (`variant="sheet"`), é o menu do celular.

- **O consumidor fornece:** `open`, `title`, `description`, `variant` (`centered`, o padrão, ou `sheet`), `onClose`, o conteúdo como `children` (por exemplo um `TextField` de confirmação ou a lista de links) e `actions` com os botões.
- Em produção é o Radix Dialog: foco preso dentro, `Esc` e o `x` fecham, o foco volta para o botão que abriu. Esta referência só mostra a aparência.
- Centralizado: `surface` com borda `line` e `radius-lg` sobre fundo preto translúcido, com no máximo 440px. Título em `section-title`, descrição em `ink-soft`.
- Em tela cheia: `surface` ocupando a tela inteira, sem borda nem cantos, com o título e o `x` numa barra separada por `line`, na altura do topo da página. O menu fecha também ao navegar. Os links do menu têm 44px de altura, separados por `line`; o da rota atual leva `aria-current` e o ponto em `pitch`.
- Fechar é o `x` com `aria-label="Fechar"`, um dos dois lugares onde ícone sozinho vale.
- Botões à direita: "Cancelar" `secondary` e a ação `primary`. Abaixo de 480px, empilhados com a ação em cima.
- Ação irreversível fica desabilitada até a confirmação: na exclusão, até o olheiro digitar o próprio e-mail.
