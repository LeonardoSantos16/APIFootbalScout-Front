# DateField

Campo de data, usado na data da observação do relatório.

- **O consumidor fornece:** `label`, `value` em `AAAA-MM-DD`, `max` (hoje, no fuso local, quando a data não pode estar no futuro), `onChange` com o novo valor, `hint`, `error` e `readOnly`.
- É um `<input type="date">` nativo com `color-scheme: dark` dentro da moldura do `TextField`: teclado e seletor do celular seguem o navegador.
- `readOnly` troca o campo pelo valor em texto, "24/11/2026", com o rótulo em cima e a dica embaixo ("A data da observação não muda depois de salvar."). Não é um campo desabilitado: não há o que editar.
- Erro em `down`, como no `TextField`.
