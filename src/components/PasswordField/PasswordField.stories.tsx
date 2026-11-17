import type { Meta, StoryObj } from '@storybook/react-vite'
import { PasswordField } from './PasswordField'

const meta = {
  component: PasswordField,
  args: { label: 'Senha', autoComplete: 'current-password', defaultValue: 'senhaboa123' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordField>

export default meta

type Story = StoryObj<typeof meta>

export const Hidden: Story = {}

export const NewPassword: Story = { args: { autoComplete: 'new-password', hint: 'De 8 a 72 caracteres.' } }

export const WithError: Story = { args: { defaultValue: '12345678', error: 'E-mail ou senha incorretos.' } }

export const Disabled: Story = { args: { disabled: true } }
