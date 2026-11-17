import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dialog } from './Dialog'

const renderDialog = (onClose = vi.fn()) => {
  render(
    <Dialog open title="Excluir conta" description="Não dá para desfazer." onClose={onClose}>
      <input aria-label="Confirmação" />
    </Dialog>,
  )
  return onClose
}

describe('Dialog', () => {
  it('e anunciado pelo titulo e pela descricao', () => {
    // Arrange
    renderDialog()

    // Act
    const dialog = screen.getByRole('dialog', { name: 'Excluir conta' })

    // Assert
    expect(dialog).toHaveAccessibleDescription('Não dá para desfazer.')
  })

  it('fecha pelo botao Fechar', async () => {
    // Arrange
    const onClose = renderDialog()

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    // Assert
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('fecha com Esc', async () => {
    // Arrange
    const onClose = renderDialog()

    // Act
    await userEvent.keyboard('{Escape}')

    // Assert
    expect(onClose).toHaveBeenCalledOnce()
  })
})
