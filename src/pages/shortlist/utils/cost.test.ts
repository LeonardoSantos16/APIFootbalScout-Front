import { describe, expect, it } from 'vitest'
import { COST_PRECISION, COST_REQUIRED, formatCost, initialCurrency, millionsInput, parseMillions } from './cost'

describe('parseMillions', () => {
  it.each([
    ['12,5', 1_250_000_000],
    ['12.5', 1_250_000_000],
    ['0,85', 85_000_000],
    [' 8 ', 800_000_000],
    ['9,75', 975_000_000],
  ])('converte "%s" milhoes em centavos', (input, cents) => {
    // Act
    const result = parseMillions(input)

    // Assert
    expect(result).toEqual({ ok: true, cents })
  })

  it.each(['0', '0,00', '-1', 'doze', '', '1,2,3'])('recusa "%s" pedindo um custo maior que zero', (input) => {
    // Act
    const result = parseMillions(input)

    // Assert
    expect(result).toEqual({ ok: false, error: COST_REQUIRED })
  })

  it('recusa tres casas decimais', () => {
    // Act
    const result = parseMillions('12,555')

    // Assert
    expect(result).toEqual({ ok: false, error: COST_PRECISION })
  })

  it('usa os textos da tela', () => {
    // Assert
    expect(COST_REQUIRED).toBe('Informe um custo maior que zero.')
    expect(COST_PRECISION).toBe('Use no máximo duas casas decimais.')
  })
})

describe('millionsInput', () => {
  it('preenche com o valor de mercado na moeda da lista', () => {
    // Act
    const input = millionsInput({ value: 12_500_000, currency: 'EUR' }, 'EUR')

    // Assert
    expect(input).toBe('12,5')
  })

  it('fica vazio quando o valor de mercado esta em outra moeda', () => {
    // Act
    const input = millionsInput({ value: 12_500_000, currency: 'BRL' }, 'EUR')

    // Assert
    expect(input).toBe('')
  })

  it('fica vazio sem valor de mercado', () => {
    // Act
    const missing = millionsInput(null, 'EUR')
    const zero = millionsInput({ value: 0, currency: 'EUR' }, 'EUR')

    // Assert
    expect(missing).toBe('')
    expect(zero).toBe('')
  })

  it('escreve valores abaixo de um milhao com virgula', () => {
    // Act
    const input = millionsInput({ value: 850_000, currency: 'EUR' }, 'EUR')

    // Assert
    expect(input).toBe('0,85')
  })
})

describe('initialCurrency', () => {
  it('usa a moeda da lista quando ela existe', () => {
    // Act
    const currency = initialCurrency({ value: 1_000_000, currency: 'BRL' }, 'EUR')

    // Assert
    expect(currency).toBe('EUR')
  })

  it('usa a moeda do valor de mercado numa lista vazia', () => {
    // Act
    const currency = initialCurrency({ value: 1_000_000, currency: 'BRL' })

    // Assert
    expect(currency).toBe('BRL')
  })

  it('cai em EUR sem valor de mercado ou com moeda fora da lista', () => {
    // Act
    const missing = initialCurrency(null)
    const other = initialCurrency({ value: 1_000_000, currency: 'JPY' })

    // Assert
    expect(missing).toBe('EUR')
    expect(other).toBe('EUR')
  })
})

describe('formatCost', () => {
  it.each([
    [1_250_000_000, 'EUR', '€12,5M'],
    [85_000_000, 'EUR', '€850 mil'],
    [975_000_000, 'GBP', '£9,8M'],
    [400_000_000, 'BRL', 'R$4M'],
  ])('mostra %i centavos em %s como %s', (quantiaEmCentavos, moeda, text) => {
    // Act
    const formatted = formatCost({ quantiaEmCentavos, moeda })

    // Assert
    expect(formatted).toBe(text)
  })
})
