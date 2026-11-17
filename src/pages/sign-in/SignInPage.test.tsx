import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { readSession } from '../../api/session'
import { signInPending, signInUnknownError, signInWrongCredentials } from '../../mocks/handlers/auth'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const signInRequests = () => {
  const calls: string[] = []
  server.events.on('request:start', ({ request }) => {
    if (new URL(request.url).pathname === '/api/Auth/signin') calls.push(request.method)
  })
  return calls
}

const fillAndSubmit = async (email: string, password: string) => {
  if (email) await userEvent.type(screen.getByLabelText('E-mail'), email)
  if (password) await userEvent.type(screen.getByLabelText('Senha'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

const openSignIn = async (url = '/entrar') => {
  const result = renderRoute(url, { session: 'signed-out' })
  await screen.findByRole('heading', { name: 'Entrar' })
  return result
}

afterEach(() => server.events.removeAllListeners())

describe('entrar', () => {
  it('abre a sessao e leva ao destino guardado', async () => {
    // Arrange
    const { router } = await openSignIn('/entrar?redirecionar=%2Fjogadores%2F1001%2Fmetricas')

    // Act
    await fillAndSubmit('ana.ribeiro@exemplo.com', 'senhaboa123')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/jogadores/1001/metricas'))
    expect(readSession()?.name).toBe('Ana Ribeiro')
  })

  it('ignora um destino externo e leva ao inicio', async () => {
    // Arrange
    const { router } = await openSignIn('/entrar?redirecionar=%2F%2Fexemplo.com')

    // Act
    await fillAndSubmit('ana.ribeiro@exemplo.com', 'senhaboa123')

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByRole('heading', { name: 'Olá, Ana.' })).toBeInTheDocument()
  })

  it('mostra as credenciais invalidas no campo de senha', async () => {
    // Arrange
    server.use(signInWrongCredentials)
    const { router } = await openSignIn()

    // Act
    await fillAndSubmit('ana.ribeiro@exemplo.com', '12345678')

    // Assert
    await waitFor(() => expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('E-mail ou senha incorretos.'))
    expect(router.state.location.pathname).toBe('/entrar')
    expect(readSession()).toBeNull()
  })

  it('so valida depois do primeiro envio e nao chama a API com erro', async () => {
    // Arrange
    const calls = signInRequests()
    await openSignIn()
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana.ribeiro')
    expect(screen.queryByText('Informe um e-mail válido.')).not.toBeInTheDocument()

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    // Assert
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('Informe um e-mail válido.')
    expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('Informe a senha.')
    expect(calls).toEqual([])
  })

  it('tira o erro enquanto o olheiro corrige o campo', async () => {
    // Arrange
    await openSignIn()
    await fillAndSubmit('ana.ribeiro', '')

    // Act
    await userEvent.type(screen.getByLabelText('E-mail'), '@exemplo.com')

    // Assert
    expect(screen.queryByText('Informe um e-mail válido.')).not.toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
  })

  it('desabilita o formulario enquanto envia', async () => {
    // Arrange
    server.use(signInPending)
    await openSignIn()

    // Act
    await fillAndSubmit('ana.ribeiro@exemplo.com', 'senhaboa123')

    // Assert
    expect(await screen.findByRole('button', { name: 'Entrando…' })).toBeDisabled()
    expect(screen.getByLabelText('E-mail')).toBeDisabled()
    expect(screen.getByLabelText('Senha')).toBeDisabled()
  })

  it('mostra o erro sem campo acima do botao', async () => {
    // Arrange
    server.use(signInUnknownError)
    await openSignIn()

    // Act
    await fillAndSubmit('ana.ribeiro@exemplo.com', 'senhaboa123')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível concluir agora.')
  })

  it('mostra o aviso de conta excluida', async () => {
    // Act
    await openSignIn('/entrar?aviso=conta-excluida')

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Conta excluída.')
  })

  it('leva para Criar conta guardando o destino', async () => {
    // Arrange
    const { router } = await openSignIn('/entrar?redirecionar=%2Fconta')

    // Act
    await userEvent.click(screen.getByRole('link', { name: 'Criar conta' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/criar-conta'))
    expect(router.state.location.search).toEqual({ redirecionar: '/conta' })
  })

  it('usa Entrar como titulo da pagina', async () => {
    // Act
    await openSignIn()

    // Assert
    expect(document.title).toBe('Entrar')
  })
})
