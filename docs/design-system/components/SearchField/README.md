# SearchField

Campo de busca de jogador: pílula com a lupa, o texto e o botão "Buscar", com o erro embaixo.

- **O consumidor fornece:** `label` (lido só pelo leitor de tela), `value`, `onChange`, `onSubmit`, `placeholder` opcional, `error` opcional e `size`.
- `size: 'default'` (48px, com o botão "Buscar") vai no corpo da página de busca e na página inicial. `size: 'compact'` (36px, sem botão, envia com Enter) vai no header.
- A busca acontece só no envio, nunca enquanto o olheiro digita: cada busca é uma chamada à fonte.
- O erro aparece só depois do envio, em `down` embaixo da pílula, ligado por `aria-describedby` ("Digite pelo menos 2 letras do nome.").
- No celular, o texto do campo usa 16px para o iOS não dar zoom ao focar.
- Nunca dois campos de busca com valores diferentes na mesma tela: na página de busca, o header não mostra o campo.
