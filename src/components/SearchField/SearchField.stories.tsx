import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { SearchField } from './SearchField'

const meta = {
  component: SearchField,
  args: {
    label: 'Nome do jogador',
    placeholder: 'Nome do jogador',
    value: '',
    onChange: fn(),
    onSubmit: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <SearchField {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof SearchField>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithTerm: Story = { args: { value: 'silva' } }

export const ShortTerm: Story = { args: { value: 's', error: 'Digite pelo menos 2 letras do nome.' } }

export const Compact: Story = { args: { label: 'Buscar jogador', placeholder: 'Buscar jogador', size: 'compact' } }

export const Disabled: Story = { args: { value: 'silva', disabled: true } }
