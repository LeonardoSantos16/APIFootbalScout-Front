import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  component: Button,
  args: { children: 'Tentar de novo' },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary', children: 'Acompanhar' } }

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Ghost: Story = { args: { variant: 'ghost', children: 'Sair' } }

export const Disabled: Story = { args: { variant: 'primary', children: 'Acompanhar', disabled: true } }

export const SecondaryDisabled: Story = { args: { variant: 'secondary', children: 'Sair de todos os dispositivos', disabled: true } }

export const GhostDisabled: Story = { args: { variant: 'ghost', children: 'Sair', disabled: true } }

export const Sending: Story = { args: { variant: 'primary', children: 'Entrando…', disabled: true } }
