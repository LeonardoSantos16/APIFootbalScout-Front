import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextArea } from './TextArea'

const meta = {
  component: TextArea,
  args: { label: 'Relato' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>

export default meta

type Story = StoryObj<typeof meta>

export const Filled: Story = {
  args: {
    defaultValue:
      'Jogo contra o Vila Nova, 90 minutos como segundo volante. Boa leitura entre as linhas, recebe de costas e gira rápido.',
  },
}

export const Empty: Story = {}

export const WithError: Story = { args: { rows: 3, error: 'Escreva o relato.' } }

export const Disabled: Story = { args: { defaultValue: 'Jogo contra o Vila Nova.', disabled: true } }
