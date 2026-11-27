import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { cleanPoints } from '../../utils/reportForm'
import { PointList } from './PointList'

const Editing = ({ initial, disabled }: { initial: string[]; disabled?: boolean }) => {
  const [items, setItems] = useState(initial)
  return (
    <PointList
      label="Pontos positivos"
      items={items}
      onChange={setItems}
      count={`${cleanPoints(items).length} de 2`}
      placeholder="Uma qualidade do jogador"
      disabled={disabled}
    />
  )
}

const meta = {
  component: Editing,
  args: { initial: ['Recebe de costas e gira rápido', ''] },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Editing>

export default meta

type Story = StoryObj<typeof meta>

export const Edit: Story = {}

export const Empty: Story = { args: { initial: [] } }

export const Disabled: Story = { args: { disabled: true } }

export const ReadOnly: Story = {
  render: () => (
    <PointList label="Pontos negativos" items={['Perde intensidade no segundo tempo', 'Pouco jogo aéreo']} readOnly />
  ),
}

export const ReadOnlyEmpty: Story = {
  render: () => <PointList label="Pontos negativos" items={[]} readOnly />,
}
