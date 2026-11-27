import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tabs } from './Tabs'

describe('Tabs', () => {
  it('le o rotulo inteiro da aba que tem forma curta', () => {
    // Act
    render(
      <Tabs
        ariaLabel="Abas do jogador"
        value="tracking"
        items={[{ id: 'tracking', label: 'Acompanhamento', shortLabel: 'Acompanh.' }]}
        renderLink={(item, props) => <a href={`#${item.id}`} {...props} />}
      />,
    )

    // Assert
    expect(screen.getByRole('link', { name: 'Acompanhamento' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Acompanh.')).toHaveAttribute('aria-hidden', 'true')
  })
})
