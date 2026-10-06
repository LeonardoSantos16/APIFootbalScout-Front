# Button

Botão em pílula para as ações da tela; `primary` é branco e aparece no máximo uma vez por tela, para a ação principal.

- **O consumidor fornece:** o texto como `children`, `variant` (`primary`, `secondary` ou `ghost`) e os atributos normais de `<button>` (`onClick`, `disabled`).
- Use `primary` para a ação que a tela existe para fazer: "Acompanhar", "Finalizar relatório", "Adicionar à shortlist".
- Use `secondary` para ações de apoio e `ghost` para cancelar ou voltar.
- Desabilite em vez de deixar o servidor recusar: no limite de 10 acompanhamentos, "Acompanhar" fica `disabled` e o contador "10 de 10" aparece ao lado.
- O texto é um verbo no infinitivo, com só a primeira letra maiúscula, sem seta.
