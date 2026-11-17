import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

const meta = {
  component: Card,
  args: {
    title: 'Métricas por 90',
    children: 'Conteúdo do cartão.',
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const WithTitle: Story = {}

export const WithSubtitleAndFooter: Story = {
  args: {
    subtitle: 'Brasileirão Série A · 2025',
    footer: 'Contagens por 90 minutos; métricas com menos de 450 min ficam sem valor.',
  },
}

export const Flush: Story = { args: { title: undefined, flush: true } }
