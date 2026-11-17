import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, userEvent, within } from 'storybook/test'
import { AppShell } from '../../components/AppShell/AppShell'
import { authHandlers, changePasswordPending, changePasswordWrongCurrent } from '../../mocks/handlers/auth'
import { AccountPage } from './AccountPage'

const EMAIL = 'ana.ribeiro@exemplo.com'

const meta = {
  component: AccountPage,
  parameters: { layout: 'fullscreen' },
  args: { onSignOutAll: fn(), onAccountDeleted: fn() },
  beforeEach({ msw }) {
    msw.use(...authHandlers)
  },
  decorators: [
    (Story) => (
      <AppShell accountLink={<a href="#conta">Ana Ribeiro</a>}>
        <Story />
      </AppShell>
    ),
  ],
} satisfies Meta<typeof AccountPage>

export default meta

type Story = StoryObj<typeof meta>

const changePassword = async (canvasElement: HTMLElement, current: string, next: string) => {
  const canvas = within(canvasElement)
  await userEvent.type(canvas.getByLabelText('Senha atual'), current)
  await userEvent.type(canvas.getByLabelText('Nova senha'), next)
  await userEvent.type(canvas.getByLabelText('Confirme a nova senha'), next)
  await userEvent.click(canvas.getByRole('button', { name: 'Alterar senha' }))
}

const openDeleteDialog = async (canvasElement: HTMLElement) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Excluir conta' }))
  return screen.findByRole('dialog', { name: 'Excluir conta' })
}

export const Default: Story = {}

export const PasswordChanged: Story = {
  play: async ({ canvasElement }) => {
    await changePassword(canvasElement, 'senhaboa123', 'novasenha1')
    await expect(await within(canvasElement).findByRole('status')).toBeInTheDocument()
  },
}

export const WrongCurrentPassword: Story = {
  beforeEach({ msw }) {
    msw.use(changePasswordWrongCurrent)
  },
  play: async ({ canvasElement }) => {
    await changePassword(canvasElement, 'errada123', 'novasenha1')
    await expect(await within(canvasElement).findByText('A senha atual está incorreta.')).toBeInTheDocument()
  },
}

export const ChangingPassword: Story = {
  beforeEach({ msw }) {
    msw.use(changePasswordPending)
  },
  play: async ({ canvasElement }) => {
    await changePassword(canvasElement, 'senhaboa123', 'novasenha1')
    await expect(await within(canvasElement).findByRole('button', { name: 'Alterando senha…' })).toBeDisabled()
  },
}

export const DeleteDialogPending: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDeleteDialog(canvasElement)
    await userEvent.type(within(dialog).getByLabelText(`Digite ${EMAIL} para confirmar`), 'ana.ribeiro@')
    await expect(within(dialog).getByRole('button', { name: 'Excluir conta' })).toBeDisabled()
  },
}

export const DeleteDialogConfirmed: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDeleteDialog(canvasElement)
    await userEvent.type(within(dialog).getByLabelText(`Digite ${EMAIL} para confirmar`), EMAIL)
    await expect(within(dialog).getByRole('button', { name: 'Excluir conta' })).toBeEnabled()
  },
}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
