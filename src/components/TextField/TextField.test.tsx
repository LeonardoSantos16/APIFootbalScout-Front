import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PasswordField } from '../PasswordField/PasswordField'
import { TextField } from './TextField'

describe('TextField', () => {
  it('e anunciado pelo rotulo e descrito pela dica', () => {
    // Arrange
    render(<TextField label="Senha" hint="De 8 a 72 caracteres." />)

    // Act
    const field = screen.getByLabelText('Senha')

    // Assert
    expect(field).toHaveAccessibleDescription('De 8 a 72 caracteres.')
    expect(field).not.toHaveAttribute('aria-invalid')
  })

  it('troca a dica pelo erro e marca o campo invalido', () => {
    // Arrange
    render(<TextField label="E-mail" hint="Seu e-mail" error="Informe um e-mail válido." />)

    // Act
    const field = screen.getByLabelText('E-mail')

    // Assert
    expect(field).toHaveAccessibleDescription('Informe um e-mail válido.')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Seu e-mail')).not.toBeInTheDocument()
  })
})

describe('PasswordField', () => {
  it('mostra e oculta a senha', async () => {
    // Arrange
    render(<PasswordField label="Senha" defaultValue="senhaboa123" />)
    const field = screen.getByLabelText('Senha')

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }))

    // Assert
    expect(field).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('desabilita o botao junto com o campo', () => {
    // Arrange
    render(<PasswordField label="Senha" disabled />)

    // Act
    const toggle = screen.getByRole('button', { name: 'Mostrar' })

    // Assert
    expect(toggle).toBeDisabled()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })
})
