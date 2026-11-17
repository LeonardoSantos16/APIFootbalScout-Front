import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SearchField } from './SearchField'

const Controlled = ({ onSubmit, size }: { onSubmit: (value: string) => void; size?: 'default' | 'compact' }) => {
  const [value, setValue] = useState('')
  return <SearchField label="Nome do jogador" value={value} onChange={setValue} onSubmit={onSubmit} size={size} />
}

describe('SearchField', () => {
  it('envia o termo com o botao Buscar', async () => {
    // Arrange
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Nome do jogador'), 'silva')

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    // Assert
    expect(onSubmit).toHaveBeenCalledWith('silva')
  })

  it('envia com Enter na versao compacta, sem botao', async () => {
    // Arrange
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} size="compact" />)

    // Act
    await userEvent.type(screen.getByLabelText('Nome do jogador'), 'silva{Enter}')

    // Assert
    expect(onSubmit).toHaveBeenCalledWith('silva')
    expect(screen.queryByRole('button', { name: 'Buscar' })).not.toBeInTheDocument()
  })

  it('descreve o campo pelo erro', () => {
    // Arrange
    render(
      <SearchField
        label="Nome do jogador"
        value="s"
        onChange={() => {}}
        onSubmit={() => {}}
        error="Digite pelo menos 2 letras do nome."
      />,
    )

    // Act
    const field = screen.getByLabelText('Nome do jogador')

    // Assert
    expect(field).toHaveAccessibleDescription('Digite pelo menos 2 letras do nome.')
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })
})
