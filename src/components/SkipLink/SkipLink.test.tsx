import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MAIN_CONTENT_ID } from './mainContent'
import { SkipLink } from './SkipLink'

const renderPage = () =>
  render(
    <>
      <SkipLink />
      <button type="button">Sair</button>
      <main id={MAIN_CONTENT_ID} tabIndex={-1}>
        <button type="button">Buscar</button>
      </main>
    </>,
  )

describe('SkipLink', () => {
  it('e o primeiro elemento focavel', async () => {
    // Arrange
    renderPage()

    // Act
    await userEvent.tab()

    // Assert
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus()
  })

  it('leva o foco ao conteudo principal', async () => {
    // Arrange
    renderPage()
    await userEvent.tab()

    // Act
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()

    // Assert
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveFocus()
  })
})
