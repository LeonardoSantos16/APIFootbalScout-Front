import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta = {
  component: StatusBadge,
  args: { tone: 'draft' },
} satisfies Meta<typeof StatusBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Draft: Story = {}

export const Finalized: Story = { args: { tone: 'finalized' } }

export const Current: Story = { args: { tone: 'current' } }
