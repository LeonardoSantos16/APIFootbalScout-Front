# Tabs

Abas de texto com sublinhado `pitch` na selecionada; é a navegação entre as seções do jogador (Perfil, Métricas) e entre seções de um cartão.

- **O consumidor fornece:** `items` (`id`, `label`, `count` opcional, `href` opcional), `value` com o id selecionado, `ariaLabel`, `onChange` (abas sem `href`) e `disabled`.
- Com `href` nos itens, as abas são links dentro de um `nav`, e a selecionada leva `aria-current="page"`: cada aba é uma rota. Sem `href`, são botões `tab` que trocam o conteúdo na mesma tela.
- `disabled` deixa as abas visíveis em `ink-subtle` e sem ação, enquanto o jogador carrega.
- `count` é um contador curto ("4", "7 de 10"), nunca uma frase.
- Não use para mais de seis opções; acima disso, use um seletor. O recorte usa o `Select`.
- Até 720px, as abas ficam numa linha só, distribuídas na largura (`space-between`, no mínimo `space-3` entre elas), sem rolagem horizontal; só quebram linha quando não cabem.
