import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { readSession } from '../../api/session'
import { changePasswordPending, signOutFailing } from '../../mocks/handlers/auth'
import { server } from '../../mocks/server'
import { renderRoute } from '../../test/renderRoute'

const EMAIL = 'ana.ribeiro@exemplo.com'

const authRequests = () => {
  const calls: string[] = []
  server.events.on('request:start', ({ request }) => {
    const { pathname } = new URL(request.url)
    if (pathname.startsWith('/api/Auth/') && !(request.method === 'GET' && pathname === '/api/Auth/me')) calls.push(`${request.method} ${pathname}`)
  })
  return calls
}

const openAccount = async () => {
  const result = renderRoute('/conta')
  await screen.findByRole('heading', { name: 'Conta' })
  return result
}

const changePassword = async (current: string, next: string, confirmation = next) => {
  await userEvent.type(screen.getByLabelText('Senha atual'), current)
  await userEvent.type(screen.getByLabelText('Nova senha'), next)
  await userEvent.type(screen.getByLabelText('Confirme a nova senha'), confirmation)
  await userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }))
}

afterEach(() => server.events.removeAllListeners())

describe('sair', () => {
  it('encerra a sessao deste dispositivo pelo topo', async () => {
    // Arrange
    const calls = authRequests()
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    const banner = screen.getByRole('banner')

    // Act
    await userEvent.click(await within(banner).findByRole('button', { name: 'Sair' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(readSession()).toBeNull()
    expect(calls).toEqual(['POST /api/Auth/signout'])
  })

  it('sai mesmo quando a chamada falha', async () => {
    // Arrange
    server.use(...signOutFailing)
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    const banner = screen.getByRole('banner')

    // Act
    await userEvent.click(await within(banner).findByRole('button', { name: 'Sair' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(readSession()).toBeNull()
  })
})

describe('conta', () => {
  it('abre pelo nome no topo com nome e e-mail', async () => {
    // Arrange
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { name: 'Olá, Ana.' })
    const banner = screen.getByRole('banner')

    // Act
    await userEvent.click(await within(banner).findByRole('link', { name: 'Ana Ribeiro' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/conta'))
    expect(await screen.findByText(`Ana Ribeiro · ${EMAIL}`)).toBeInTheDocument()
    expect(document.title).toBe('Conta · APIFootballScout')
  })
})

describe('alterar senha', () => {
  it('troca a senha, guarda o par novo e limpa os campos', async () => {
    // Arrange
    await openAccount()
    const previousToken = readSession()?.accessToken

    // Act
    await changePassword('senhaboa123', 'novasenha1')

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Senha alterada. As outras sessões encerram em até 15 minutos.',
    )
    expect(screen.getByLabelText('Senha atual')).toHaveValue('')
    expect(screen.getByLabelText('Nova senha')).toHaveValue('')
    expect(screen.getByLabelText('Confirme a nova senha')).toHaveValue('')
    expect(readSession()?.accessToken).not.toBe(previousToken)
  })

  it('mostra a senha atual errada no campo', async () => {
    // Arrange
    await openAccount()

    // Act
    await changePassword('errada123', 'novasenha1')

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText('Senha atual')).toHaveAccessibleDescription('A senha atual está incorreta.'),
    )
    expect(readSession()).not.toBeNull()
  })

  it('recusa a nova senha igual a atual', async () => {
    // Arrange
    await openAccount()

    // Act
    await changePassword('senhaboa123', 'senhaboa123')

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText('Nova senha')).toHaveAccessibleDescription(
        'A nova senha precisa ser diferente da atual.',
      ),
    )
  })

  it('recusa a confirmacao diferente sem chamar a API', async () => {
    // Arrange
    const calls = authRequests()
    await openAccount()

    // Act
    await changePassword('senhaboa123', 'novasenha1', 'novasenha2')

    // Assert
    expect(screen.getByLabelText('Confirme a nova senha')).toHaveAccessibleDescription('As senhas não conferem.')
    expect(calls).toEqual([])
  })

  it('desabilita o formulario enquanto envia', async () => {
    // Arrange
    server.use(changePasswordPending)
    await openAccount()

    // Act
    await changePassword('senhaboa123', 'novasenha1')

    // Assert
    expect(await screen.findByRole('button', { name: 'Alterando senha…' })).toBeDisabled()
    expect(screen.getByLabelText('Senha atual')).toBeDisabled()
  })
})

describe('sair de todos os dispositivos', () => {
  it('encerra todas as sessoes e vai para Entrar sem aviso', async () => {
    // Arrange
    const calls = authRequests()
    const { router } = await openAccount()
    expect(
      screen.getByText(
        'Sair de todos os dispositivos encerra esta sessão agora. As outras sessões encerram em até 15 minutos.',
      ),
    ).toBeInTheDocument()

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Sair de todos os dispositivos' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(router.state.location.search).toEqual({})
    expect(readSession()).toBeNull()
    expect(calls).toEqual(['POST /api/Auth/signout-all'])
  })

  it('sai mesmo quando a chamada falha', async () => {
    // Arrange
    server.use(...signOutFailing)
    const { router } = await openAccount()

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Sair de todos os dispositivos' }))

    // Assert
    await waitFor(() => expect(router.state.location.pathname).toBe('/entrar'))
    expect(readSession()).toBeNull()
  })
})

describe('excluir conta', () => {
  const openDialog = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Excluir conta' }))
    return screen.findByRole('dialog', { name: 'Excluir conta' })
  }

  it('so habilita a exclusao com o e-mail digitado', async () => {
    // Arrange
    await openAccount()
    const dialog = await openDialog()

    // Act
    await userEvent.type(within(dialog).getByLabelText(`Digite ${EMAIL} para confirmar`), 'ana.ribeiro@')

    // Assert
    expect(dialog).toHaveAccessibleDescription(
      'A conta será apagada com seus relatórios, shortlists e acompanhamentos. Não dá para desfazer.',
    )
    expect(within(dialog).getByRole('button', { name: 'Excluir conta' })).toBeDisabled()
  })

  it.each([['Cancelar'], ['Fechar']])('fecha pelo %s sem chamar a API', async (button) => {
    // Arrange
    const calls = authRequests()
    await openAccount()
    const dialog = await openDialog()

    // Act
    await userEvent.click(within(dialog).getByRole('button', { name: button }))

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(calls).toEqual([])
  })

  it('exclui a conta e vai para Entrar com o aviso', async () => {
    // Arrange
    const calls = authRequests()
    const { router } = await openAccount()
    const dialog = await openDialog()
    await userEvent.type(within(dialog).getByLabelText(`Digite ${EMAIL} para confirmar`), EMAIL)

    // Act
    await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir conta' }))

    // Assert
    expect(await screen.findByText('Conta excluída.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/entrar')
    expect(readSession()).toBeNull()
    expect(calls).toEqual(['DELETE /api/Auth/me'])
  })
})
