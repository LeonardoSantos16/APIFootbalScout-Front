import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const meta = {
  component: Tabs,
  args: {
    ariaLabel: 'Abas do jogador',
    value: 'metrics',
    items: [{ id: 'metrics', label: 'Métricas por 90' }],
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const SingleTab: Story = {}

export const SeveralTabs: Story = {
  args: {
    items: [
      { id: 'metrics', label: 'Métricas por 90' },
      { id: 'compare', label: 'Comparar' },
      { id: 'reports', label: 'Relatórios' },
    ],
  },
}
