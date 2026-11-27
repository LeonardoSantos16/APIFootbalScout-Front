import { describe, expect, it } from 'vitest'
import type { ReportForm, ReportResponse } from '../interfaces/report'
import { cleanPoints, editPayload, emptyForm, isDirty, parseRating, toForm, validateForm } from './reportForm'

const saved: ReportResponse = {
  relatorioId: 'r1',
  jogadorId: 1001,
  status: 'Rascunho',
  texto: 'Jogo contra o Vila Nova.',
  observadoEm: new Date(2026, 10, 20).toISOString(),
  escritoEm: new Date(2026, 10, 20, 12).toISOString(),
  pontosPositivos: ['Recebe de costas e gira rápido'],
  pontosNegativos: [],
  version: 3,
  nota: 7.5,
  parecer: 'Monitorar',
}

const form = (overrides: Partial<ReportForm> = {}): ReportForm => ({ ...toForm(saved), ...overrides })

describe('emptyForm', () => {
  it('comeca com a data de hoje e o resto vazio', () => {
    // Act
    const empty = emptyForm('2026-11-24')

    // Assert
    expect(empty).toEqual({
      observation: '2026-11-24',
      narrative: '',
      rating: '',
      verdict: null,
      positivePoints: [],
      negativePoints: [],
    })
  })

  it('comeca a correcao com o relato do relatorio corrigido', () => {
    // Act
    const correction = emptyForm('2026-11-14', 'Clássico estadual.')

    // Assert
    expect(correction.narrative).toBe('Clássico estadual.')
    expect(correction.rating).toBe('')
  })
})

describe('toForm', () => {
  it('le o relatorio salvo com a nota em virgula e a data da observacao local', () => {
    // Act
    const loaded = toForm(saved)

    // Assert
    expect(loaded).toEqual({
      observation: '2026-11-20',
      narrative: 'Jogo contra o Vila Nova.',
      rating: '7,5',
      verdict: 'Monitorar',
      positivePoints: ['Recebe de costas e gira rápido'],
      negativePoints: [],
    })
  })

  it('le a nota inteira sem casa decimal', () => {
    // Act
    const loaded = toForm({ ...saved, nota: 8 })

    // Assert
    expect(loaded.rating).toBe('8')
  })

  it('le o rascunho sem nota e sem parecer', () => {
    // Act
    const loaded = toForm({ ...saved, nota: null, parecer: null })

    // Assert
    expect(loaded.rating).toBe('')
    expect(loaded.verdict).toBeNull()
  })
})

describe('parseRating', () => {
  it.each([
    ['7,5', 7.5],
    ['7.5', 7.5],
    [' 10 ', 10],
    ['0', 0],
  ])('aceita %s', (text, value) => {
    // Act
    const rating = parseRating(text)

    // Assert
    expect(rating).toEqual({ kind: 'valid', value })
  })

  it('reconhece a nota vazia', () => {
    // Act
    const rating = parseRating('  ')

    // Assert
    expect(rating).toEqual({ kind: 'empty' })
  })

  it.each(['11', '-1', 'sete'])('recusa %s fora da faixa', (text) => {
    // Act
    const rating = parseRating(text)

    // Assert
    expect(rating).toEqual({ kind: 'invalid', message: 'A nota deve estar entre 0 e 10.' })
  })

  it('recusa mais de uma casa decimal', () => {
    // Act
    const rating = parseRating('7,25')

    // Assert
    expect(rating).toEqual({ kind: 'invalid', message: 'A nota aceita no máximo uma casa decimal.' })
  })
})

describe('cleanPoints', () => {
  it('tira os espacos das pontas e descarta os pontos vazios', () => {
    // Act
    const points = cleanPoints(['  Fôlego até o fim ', '', '   ', 'Cruzamento de primeira'])

    // Assert
    expect(points).toEqual(['Fôlego até o fim', 'Cruzamento de primeira'])
  })
})

describe('validateForm', () => {
  it('pede o relato quando ele esta vazio', () => {
    // Act
    const errors = validateForm(emptyForm('2026-11-24'))

    // Assert
    expect(errors).toEqual({ narrative: 'Escreva o relato.' })
  })

  it('pede o relato quando ele so tem espacos', () => {
    // Act
    const errors = validateForm(form({ narrative: '   ' }), saved)

    // Assert
    expect(errors.narrative).toBe('Escreva o relato.')
  })

  it('repassa a mensagem da nota invalida', () => {
    // Act
    const errors = validateForm(form({ rating: '11' }), saved)

    // Assert
    expect(errors).toEqual({ rating: 'A nota deve estar entre 0 e 10.' })
  })

  it('pede a nota quando o olheiro apaga uma nota ja salva', () => {
    // Act
    const errors = validateForm(form({ rating: '' }), saved)

    // Assert
    expect(errors).toEqual({ rating: 'Informe a nota.' })
  })

  it('aceita a nota vazia quando nenhuma foi salva', () => {
    // Act
    const errors = validateForm(form({ rating: '' }), { ...saved, nota: null })

    // Assert
    expect(errors).toEqual({})
  })

  it('aceita o formulario valido', () => {
    // Act
    const errors = validateForm(form(), saved)

    // Assert
    expect(errors).toEqual({})
  })
})

describe('editPayload', () => {
  it('nao manda nada quando nada mudou', () => {
    // Act
    const payload = editPayload(saved, form())

    // Assert
    expect(payload).toEqual({})
  })

  it('manda so os campos que mudaram', () => {
    // Act
    const payload = editPayload(saved, form({ narrative: 'Relato novo.', rating: '8,0' }))

    // Assert
    expect(payload).toEqual({ texto: 'Relato novo.', nota: 8 })
  })

  it('manda a lista inteira, limpa, quando um ponto muda', () => {
    // Act
    const payload = editPayload(
      saved,
      form({ positivePoints: ['Recebe de costas e gira rápido', '  Fôlego até o fim ', ''] }),
    )

    // Assert
    expect(payload).toEqual({ pontosPositivos: ['Recebe de costas e gira rápido', 'Fôlego até o fim'] })
  })

  it('manda a lista vazia quando o olheiro remove o ultimo ponto', () => {
    // Act
    const payload = editPayload(saved, form({ positivePoints: [] }))

    // Assert
    expect(payload).toEqual({ pontosPositivos: [] })
  })

  it('manda o parecer escolhido', () => {
    // Act
    const payload = editPayload({ ...saved, parecer: null }, form({ verdict: 'Contratar' }))

    // Assert
    expect(payload).toEqual({ parecer: 'Contratar' })
  })

  it('ignora um campo em branco a mais nas listas', () => {
    // Act
    const payload = editPayload(saved, form({ negativePoints: [''] }))

    // Assert
    expect(payload).toEqual({})
  })
})

describe('isDirty', () => {
  it('considera sujo o relatorio que ainda nao foi salvo', () => {
    // Act
    const dirty = isDirty(undefined, emptyForm('2026-11-24'))

    // Assert
    expect(dirty).toBe(true)
  })

  it('considera limpo o formulario igual ao salvo', () => {
    // Act
    const dirty = isDirty(saved, form())

    // Assert
    expect(dirty).toBe(false)
  })

  it('considera sujo depois de uma mudanca no relato', () => {
    // Act
    const dirty = isDirty(saved, form({ narrative: 'Relato novo.' }))

    // Assert
    expect(dirty).toBe(true)
  })

  it('volta a ficar limpo quando o texto salvo e restaurado', () => {
    // Act
    const dirty = isDirty(saved, form({ narrative: 'Jogo contra o Vila Nova.', rating: '7.5' }))

    // Assert
    expect(dirty).toBe(false)
  })

  it('considera sujo quando a nota digitada e invalida', () => {
    // Act
    const dirty = isDirty(saved, form({ rating: '7,25' }))

    // Assert
    expect(dirty).toBe(true)
  })
})
