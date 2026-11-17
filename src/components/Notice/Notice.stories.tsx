import type { Meta, StoryObj } from '@storybook/react-vite'
import { Notice } from './Notice'

const meta = {
  component: Notice,
  args: { children: 'Sua sessão expirou. Entre novamente.' },
} satisfies Meta<typeof Notice>

export default meta

type Story = StoryObj<typeof meta>

export const SessionExpired: Story = {}

export const PasswordChanged: Story = {
  args: { children: 'Senha alterada. As outras sessões encerram em até 15 minutos.' },
}
