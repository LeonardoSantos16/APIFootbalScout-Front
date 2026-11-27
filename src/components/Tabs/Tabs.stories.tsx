import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const meta = {
  component: Tabs,
  args: {
    ariaLabel: 'Abas do jogador',
    value: 'profile',
    items: [
      { id: 'profile', label: 'Perfil' },
      { id: 'metrics', label: 'Métricas' },
    ],
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Links: Story = {
  args: { renderLink: (item, props) => <a href={`#${item.id}`} {...props} /> },
}

export const LinksDisabled: Story = {
  args: { ...Links.args, disabled: true },
}

export const Buttons: Story = {
  args: {
    value: 'drafts',
    items: [
      { id: 'drafts', label: 'Rascunhos' },
      { id: 'final', label: 'Finalizados' },
    ],
  },
}

export const PlayerTabs: Story = {
  args: {
    ...Links.args,
    value: 'tracking',
    items: [
      { id: 'profile', label: 'Perfil' },
      { id: 'metrics', label: 'Métricas' },
      { id: 'comparison', label: 'Comparação' },
      { id: 'tracking', label: 'Acompanhamento', shortLabel: 'Acompanh.' },
      { id: 'reports', label: 'Relatórios' },
    ],
  },
  globals: { viewport: { value: 'mobile1' } },
}

export const PlayerTabsOnDesktop: Story = {
  args: PlayerTabs.args,
}
