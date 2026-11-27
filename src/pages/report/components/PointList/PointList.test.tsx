import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PointList } from './PointList'

describe('PointList', () => {
  it('edita um ponto e devolve a lista inteira', () => {
    // Arrange
    const onChange = vi.fn()
    render(<PointList label="Pontos positivos" items={['Fôlego', 'Cruzamento']} onChange={onChange} />)

    // Act
    fireEvent.change(screen.getByLabelText('Pontos positivos, ponto 2'), { target: { value: 'Cruzamento de primeira' } })

    // Assert
    expect(onChange).toHaveBeenCalledWith(['Fôlego', 'Cruzamento de primeira'])
  })

  it('remove o ponto escolhido', () => {
    // Arrange
    const onChange = vi.fn()
    render(<PointList label="Pontos negativos" items={['Recomposição', 'Jogo aéreo']} onChange={onChange} />)

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Remover ponto 1' }))

    // Assert
    expect(onChange).toHaveBeenCalledWith(['Jogo aéreo'])
  })

  it('acrescenta um ponto vazio no fim', () => {
    // Arrange
    const onChange = vi.fn()
    render(<PointList label="Pontos negativos" items={[]} onChange={onChange} />)

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ponto' }))

    // Assert
    expect(onChange).toHaveBeenCalledWith([''])
  })

  it('mostra a lista sem campos na leitura', () => {
    // Act
    render(<PointList label="Pontos positivos" items={['Fôlego até o fim']} readOnly />)

    // Assert
    expect(screen.getByText('Fôlego até o fim')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
