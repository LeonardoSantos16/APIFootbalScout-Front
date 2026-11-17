import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Select } from './Select'

const meta = {
  component: Select,
  args: {
    label: 'Competição e temporada',
    value: '325-72034-Clube',
    onChange: fn(),
    options: [
      { value: '325-72034-Clube', label: 'Brasileirão Série A · 2025' },
      { value: '325-58766-Clube', label: 'Brasileirão Série A · 2024' },
    ],
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const ClubOnly: Story = {}

export const WithNationalTeam: Story = {
  args: {
    options: [
      { value: '325-72034-Clube', label: 'Clube · Brasileirão Série A · 2025' },
      { value: '295-53820-Selecao', label: 'Seleção · Eliminatórias Sul-Americanas · 2025' },
    ],
  },
}

export const Loading: Story = { args: { loading: true } }
