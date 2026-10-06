---
status: accepted
---

# CSS Modules para estilizar componentes

Os componentes usam CSS Modules (`Componente.module.css`) sobre as variaveis de `src/styles/tokens.css`. O styled-components foi considerado e descartado: entrou em modo de manutencao em 2025 e gera o CSS em tempo de execucao, com custo de render e de bundle. CSS Modules ja vem no Vite, nao tem custo em execucao, isola as classes por componente e casa direto com os tokens e com o `bundle.css` de referencia do design system, que ja e CSS puro.

## Consequencias

- Cor, fonte, espaco e raio sempre por variavel (`var(--surface)`, `font: var(--text-stat-value)`), nunca valor literal.
- Variantes viram classes combinadas no componente (`styles.button`, `styles.primary`), nao props interpoladas no CSS.
- Valores que so existem em execucao, como a cor do clube vinda de `teamColors`, entram por custom property inline (`style={{ '--club': cor }}`), e o CSS continua lendo `var(--club)`.
- O vanilla-extract fica como alternativa se variantes tipadas em TypeScript fizerem falta.
