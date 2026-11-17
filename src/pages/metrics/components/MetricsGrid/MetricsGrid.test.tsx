import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildRows, footerSample, footerText } from '../../utils/metrics'
import { MetricsGrid } from './MetricsGrid'
import { insufficientSampleAttributes, metricsResponse } from '../../../../mocks/fixtures/metrics'

describe('MetricsGrid', () => {
  it('mostra as sete linhas com o motivo quando tudo e recusado', () => {
    // Arrange
    const rows = buildRows(metricsResponse(insufficientSampleAttributes))

    // Act
    render(<MetricsGrid rows={rows} footnote={footerText(footerSample(insufficientSampleAttributes))} />)

    // Assert
    expect(screen.getAllByText('Amostra insuficiente: 312 de 450 min')).toHaveLength(7)
    expect(screen.getByText('Gols, por 90')).toBeInTheDocument()
    expect(screen.getByText('Precisão de passe')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra os sete rotulos e so a regra do minimo enquanto carrega', () => {
    // Act
    render(<MetricsGrid footnote={footerText()} />)

    // Assert
    expect(screen.getByText('Nota, média')).toBeInTheDocument()
    expect(
      screen.getByText('Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/^\d+,\d+%?$/)).not.toBeInTheDocument()
  })

  it('mostra a amostra so na linha que difere do rodape', () => {
    // Arrange
    const rows = buildRows(
      metricsResponse([
        ...insufficientSampleAttributes.slice(0, 6),
        { tipo: 'PrecisaoDePasse', resultado: 'Calculada', valor: 86.43, amostraEmMinutos: 1190 },
      ]),
    )

    // Act
    render(<MetricsGrid rows={rows} footnote="" />)

    // Assert
    expect(screen.getByText('86,4%')).toBeInTheDocument()
    expect(screen.getAllByText(/min jogados$/)).toHaveLength(1)
  })
})
