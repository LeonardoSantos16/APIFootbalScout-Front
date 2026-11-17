import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { initials } from '../../utils/player'
import { PlayerPhoto } from './PlayerPhoto'

describe('PlayerPhoto', () => {
  it('mostra a foto com o nome do jogador', () => {
    // Arrange
    render(<PlayerPhoto name="Rafael Silva" src="https://exemplo.com/foto.png" />)

    // Act
    const photo = screen.getByRole('img', { name: 'Rafael Silva' })

    // Assert
    expect(photo).toHaveAttribute('src', 'https://exemplo.com/foto.png')
  })

  it('troca pelas iniciais quando a imagem falha', () => {
    // Arrange
    render(<PlayerPhoto name="Rafael Silva" src="https://exemplo.com/foto.png" />)

    // Act
    fireEvent.error(screen.getByRole('img', { name: 'Rafael Silva' }))

    // Assert
    expect(screen.getByRole('img', { name: 'Rafael Silva' })).toHaveTextContent('RS')
  })

  it('mostra as iniciais sem imagem', () => {
    // Arrange
    render(<PlayerPhoto name="Caio Ventura" />)

    // Act
    const photo = screen.getByRole('img', { name: 'Caio Ventura' })

    // Assert
    expect(photo).toHaveTextContent('CV')
  })

  it('usa a primeira e a ultima palavra do nome', () => {
    // Arrange
    const name = 'Gabriel Henrique dos Santos'

    // Act
    const result = initials(name)

    // Assert
    expect(result).toBe('GS')
  })
})
