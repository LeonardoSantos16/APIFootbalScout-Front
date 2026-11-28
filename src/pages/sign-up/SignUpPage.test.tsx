import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { readSession } from '../../api/session'
import { signUpEmailTaken, signUpPending } from '../../mocks/handlers/auth'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const fillAndSubmit = async (name: string, email: string, password: string) => {
  if (name) await userEvent.type(screen.getByLabelText('Nome'), name)
  if (email) await userEvent.type(screen.getByLabelText('E-mail'), email)
  if (password) await userEvent.type(screen.getByLabelText('Senha'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
}

const openSignUp = async (url = '/criar-conta') => {
  const result = renderRoute(url, { session: 'signed-out' })
  await screen.findByRole('heading', { name: 'Criar conta' })
  return result
}

describe('criar conta', () => {
  it('cria a conta, abre a sessao e leva ao inicio com o nome no topo', async () => {
    // Arrange
    const { router } = await openSignUp()

    // Act
    await fillAndSubmit('Bruno Lacerda', 'bruno.lacerda@exemplo.com', 'senhaboa123')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByRole('heading', { name: 'Olá, Bruno.' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Bruno Lacerda' })).toBeInTheDocument()
    expect(readSession()?.email).toBe('bruno.lacerda@exemplo.com')
  })

  it('leva ao destino guardado depois de criar a conta', async () => {
    // Arrange
    const { router } = await openSignUp('/criar-conta?redirecionar=%2Fjogadores%2F1001%2Fmetricas')

    // Act
    await fillAndSubmit('Bruno Lacerda', 'bruno.lacerda@exemplo.com', 'senhaboa123')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
  })

  it('mostra o e-mail ja usado no campo de e-mail', async () => {
    // Arrange
    server.use(signUpEmailTaken)
    const { router } = await openSignUp()

    // Act
    await fillAndSubmit('Ana Ribeiro', 'ana.ribeiro@exemplo.com', 'senhaboa123')

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('Este e-mail já está cadastrado.'),
    )
    expect(router.state.location.pathname).toBe('/criar-conta')
  })

  it('valida nome e senha pelos limites do contrato', async () => {
    // Arrange
    await openSignUp()

    // Act
    await fillAndSubmit('A', 'ana.ribeiro@exemplo.com', '1234')

    // Assert
    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('O nome precisa ter de 2 a 120 caracteres.')
    expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('A senha precisa ter de 8 a 72 caracteres.')
  })

  it('mostra a dica da senha antes de qualquer erro', async () => {
    // Act
    await openSignUp()

    // Assert
    expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('De 8 a 72 caracteres.')
  })

  it('desabilita o formulario enquanto envia', async () => {
    // Arrange
    server.use(signUpPending)
    await openSignUp()

    // Act
    await fillAndSubmit('Bruno Lacerda', 'bruno.lacerda@exemplo.com', 'senhaboa123')

    // Assert
    expect(await screen.findByRole('button', { name: 'Criando conta…' })).toBeDisabled()
    expect(screen.getByLabelText('Nome')).toBeDisabled()
  })

  it('leva para Entrar', async () => {
    // Arrange
    const { router } = await openSignUp()

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Entrar' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
  })

  it('usa Criar conta como titulo da pagina', async () => {
    // Act
    await openSignUp()

    // Assert
    expect(document.title).toBe('Criar conta · APIFootballScout')
  })
})
