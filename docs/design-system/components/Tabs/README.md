# Tabs

Abas de texto com sublinhado `pitch` na selecionada; é o seletor de recorte e a navegação entre seções de um cartão.

- **O consumidor fornece:** `items` (`id`, `label`, `count` opcional), `value` com o id selecionado, `onChange` e `ariaLabel`.
- Para o recorte, gere os itens a partir de `stats` do perfil do jogador e guarde o selecionado na URL.
- `count` é um contador curto ("4", "7 de 10"), nunca uma frase.
- Não use para mais de seis opções; acima disso, use um seletor.
