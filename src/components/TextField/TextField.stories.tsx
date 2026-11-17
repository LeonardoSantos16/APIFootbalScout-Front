import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextField } from './TextField'

const meta = {
  component: TextField,
  args: { label: 'E-mail', type: 'email', autoComplete: 'email' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithHint: Story = { args: { label: 'Nome', type: 'text', hint: 'De 2 a 120 caracteres.' } }

export const WithError: Story = { args: { defaultValue: 'ana.ribeiro', error: 'Informe um e-mail válido.' } }

export const Disabled: Story = { args: { defaultValue: 'ana.ribeiro@exemplo.com', disabled: true } }
