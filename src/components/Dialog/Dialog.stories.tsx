import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { TextField } from '../TextField/TextField'
import { Dialog } from './Dialog'

const EMAIL = 'ana.ribeiro@exemplo.com'

const actions = (enabled: boolean) => (
  <>
    <Button>Cancelar</Button>
    <Button variant="primary" disabled={!enabled}>
      Excluir conta
    </Button>
  </>
)

const meta = {
  component: Dialog,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Excluir conta',
    description: 'A conta será apagada com seus relatórios, shortlists e acompanhamentos. Não dá para desfazer.',
    onClose: fn(),
  },
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const ConfirmationPending: Story = {
  args: {
    actions: actions(false),
    children: <TextField label={`Digite ${EMAIL} para confirmar`} type="email" defaultValue="ana.ribeiro@" />,
  },
}

export const ConfirmationTyped: Story = {
  args: {
    actions: actions(true),
    children: <TextField label={`Digite ${EMAIL} para confirmar`} type="email" defaultValue={EMAIL} />,
  },
}

export const Phone: Story = {
  ...ConfirmationPending,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

export const Sheet: Story = {
  args: {
    variant: 'sheet',
    title: 'Menu',
    description: undefined,
    children: (
      <nav aria-label="Principal">
        <a href="#inicio">Início</a>
      </nav>
    ),
  },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
