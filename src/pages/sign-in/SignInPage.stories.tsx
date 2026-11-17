import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { AuthShell } from '../../components/AuthShell/AuthShell'
import { signInPending, signInUnknownError, signInWrongCredentials } from '../../mocks/handlers/auth'
import { SignInPage } from './SignInPage'

const meta = {
  component: SignInPage,
  parameters: { layout: 'fullscreen', session: 'signed-out' },
  args: { onSignedIn: fn(), signUpLink: <a href="#criar-conta">Criar conta</a> },
  decorators: [
    (Story) => (
      <AuthShell>
        <Story />
      </AuthShell>
    ),
  ],
} satisfies Meta<typeof SignInPage>

export default meta

type Story = StoryObj<typeof meta>

const fillAndSubmit = async (canvasElement: HTMLElement, email: string, password: string) => {
  const canvas = within(canvasElement)
  if (email) await userEvent.type(canvas.getByLabelText('E-mail'), email)
  if (password) await userEvent.type(canvas.getByLabelText('Senha'), password)
  await userEvent.click(canvas.getByRole('button', { name: 'Entrar' }))
}

export const Empty: Story = {}

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'ana.ribeiro', '')
    await expect(within(canvasElement).getByText('Informe um e-mail válido.')).toBeInTheDocument()
  },
}

export const WrongCredentials: Story = {
  beforeEach({ msw }) {
    msw.use(signInWrongCredentials)
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'ana.ribeiro@exemplo.com', '12345678')
    await expect(await within(canvasElement).findByText('E-mail ou senha incorretos.')).toBeInTheDocument()
  },
}

export const Sending: Story = {
  beforeEach({ msw }) {
    msw.use(signInPending)
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'ana.ribeiro@exemplo.com', 'senhaboa123')
    await expect(await within(canvasElement).findByRole('button', { name: 'Entrando…' })).toBeDisabled()
  },
}

export const UnknownError: Story = {
  beforeEach({ msw }) {
    msw.use(signInUnknownError)
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'ana.ribeiro@exemplo.com', 'senhaboa123')
    await expect(await within(canvasElement).findByRole('alert')).toBeInTheDocument()
  },
}

export const SessionExpired: Story = { args: { notice: 'sessao-expirada' } }

export const AccountDeleted: Story = { args: { notice: 'conta-excluida' } }

export const Phone: Story = {
  args: { notice: 'sessao-expirada' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
