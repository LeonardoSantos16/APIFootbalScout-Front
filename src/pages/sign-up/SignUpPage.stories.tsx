import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { AuthShell } from '../../components/AuthShell/AuthShell'
import { signUpEmailTaken, signUpPending } from '../../mocks/handlers/auth'
import { SignUpPage } from './SignUpPage'

const meta = {
  component: SignUpPage,
  parameters: { layout: 'fullscreen', session: 'signed-out' },
  args: { onSignedUp: fn(), signInLink: <a href="#entrar">Entrar</a> },
  decorators: [
    (Story) => (
      <AuthShell>
        <Story />
      </AuthShell>
    ),
  ],
} satisfies Meta<typeof SignUpPage>

export default meta

type Story = StoryObj<typeof meta>

const fillAndSubmit = async (canvasElement: HTMLElement, name: string, email: string, password: string) => {
  const canvas = within(canvasElement)
  if (name) await userEvent.type(canvas.getByLabelText('Nome'), name)
  if (email) await userEvent.type(canvas.getByLabelText('E-mail'), email)
  if (password) await userEvent.type(canvas.getByLabelText('Senha'), password)
  await userEvent.click(canvas.getByRole('button', { name: 'Criar conta' }))
}

export const Empty: Story = {}

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'A', 'ana.ribeiro@exemplo.com', '1234')
    await expect(within(canvasElement).getByText('A senha precisa ter de 8 a 72 caracteres.')).toBeInTheDocument()
  },
}

export const EmailTaken: Story = {
  beforeEach({ msw }) {
    msw.use(signUpEmailTaken)
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'Ana Ribeiro', 'ana.ribeiro@exemplo.com', 'senhaboa123')
    await expect(await within(canvasElement).findByText('Este e-mail já está cadastrado.')).toBeInTheDocument()
  },
}

export const Sending: Story = {
  beforeEach({ msw }) {
    msw.use(signUpPending)
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, 'Ana Ribeiro', 'ana.ribeiro@exemplo.com', 'senhaboa123')
    await expect(await within(canvasElement).findByRole('button', { name: 'Criando conta…' })).toBeDisabled()
  },
}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
