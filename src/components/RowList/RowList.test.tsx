import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RowList } from './RowList'

describe('RowList', () => {
  it('faz da linha inteira um link com o titulo e o apoio', () => {
    // Arrange
    render(
      <RowList
        ariaLabel="Resultados"
        rows={[{ id: '1001', title: 'Rafael Silva', detail: 'Meio-campo, Atlético Serrano, Brasil' }]}
        renderLink={(row, props) => <a href={`#${row.id}`} {...props} />}
      />,
    )

    // Act
    const link = screen.getByRole('link', { name: /Rafael Silva/ })

    // Assert
    expect(link).toHaveTextContent('Meio-campo, Atlético Serrano, Brasil')
    expect(link).toHaveAttribute('href', '#1001')
  })

  it('mostra as celulas e o rotulo de cada uma', () => {
    // Arrange
    render(
      <RowList
        ariaLabel="Recortes"
        columns={['Jogos', 'Minutos']}
        titleLabel="Recorte"
        rows={[
          {
            id: 'a',
            title: 'Brasileirão Série A · 2025',
            cells: [
              { value: '24', label: 'jogos' },
              { value: '1.920', label: 'min' },
            ],
          },
        ]}
      />,
    )

    // Act
    const item = screen.getByRole('listitem')

    // Assert
    expect(within(item).getByText('Brasileirão Série A · 2025')).toBeInTheDocument()
    expect(item).toHaveTextContent('24 jogos')
    expect(item).toHaveTextContent('1.920 min')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
