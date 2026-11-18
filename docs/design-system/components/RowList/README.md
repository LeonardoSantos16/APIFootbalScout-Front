# RowList

Lista de linhas separadas por `line`: resultados da busca, recortes do perfil e transferências.

- **O consumidor fornece:** `rows` (`id`, `title`, `detail` opcional, `href` opcional, `cells` opcional, `aside` opcional), `ariaLabel`, `footer` opcional e, para uma tabela, `columns` e `titleLabel`.
- Com `href`, a linha inteira é um link, sem botão dentro dela.
- `title` em `body-strong`; `detail` é a linha de apoio em `label`, `ink-soft` ("Meio-campo, Atlético Serrano, Brasil", "jan. 2024 · €3,2M").
- Com `columns`, cada linha ganha células numéricas alinhadas à direita, com `tabular-nums` e um cabeçalho. Abaixo de 720px, o cabeçalho some e as células viram uma linha de apoio com o `label` de cada uma ("24 jogos · 1.920 min · 4 gols").
- `footer` leva o botão secundário "Mostrar todos os recortes (14)" quando a lista é cortada.
- Coloque a lista dentro de um `Card`; o espaço vertical de cada linha é `space-3`.
