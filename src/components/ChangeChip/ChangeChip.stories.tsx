import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChangeChip } from './ChangeChip'

const meta = {
  component: ChangeChip,
  args: { direction: 'up', children: '+20,0% alta' },
} satisfies Meta<typeof ChangeChip>

export default meta

type Story = StoryObj<typeof meta>

export const Up: Story = {}

export const Down: Story = {
  args: { direction: 'down', children: '−20,0% queda' },
}

export const MoreMinutes: Story = {
  args: { direction: 'up', children: '+420 min a mais' },
}
