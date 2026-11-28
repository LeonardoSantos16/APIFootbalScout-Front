# MoneyField

Campo de quantia em milhões com a moeda, usado no custo estimado de um alvo da shortlist.

- **O consumidor fornece:** `label` (padrão "Custo estimado"), `value` como texto ("12,5"), `onChange`, `currency`, `onCurrencyChange`, `currencies` (padrão EUR, BRL, USD e GBP), `lockedCurrency`, `placeholder`, `hint`, `error` e `disabled`.
- A quantia fica na moldura do `TextField`, com `inputmode="decimal"` e o sufixo "M" fixo em `ink-muted`: abaixo de 1 milhão o olheiro digita "0,85". O componente não converte nem valida: quem consome aceita vírgula, até duas casas, exige valor maior que zero e converte milhões em centavos.
- A moeda é um `<select>` nativo na mesma moldura (`radius-md`, não pílula), ao lado da quantia. Com `lockedCurrency`, vira o código em `ink-muted` sem seletor, e a dica explica ("A moeda da lista é EUR.").
- A exibição do valor fora do campo usa `formatMoney`, com até uma casa ("€12,5M", "€850 mil").
- Abaixo de 720px os dois campos usam a fonte de toque, para o celular não dar zoom.
