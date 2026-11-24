import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from '../../../../components/Card/Card'
import { TrackingStart } from './TrackingStart'

const meta = {
  component: TrackingStart,
  args: {
    options: [
      { value: '325-72034-Clube', label: 'Clube · Brasileirão Série A · 2025' },
      { value: '373-72034-Clube', label: 'Clube · Copa do Brasil · 2025' },
    ],
    value: '325-72034-Clube',
    onSelect: () => undefined,
    onOpen: () => undefined,
  },
  decorators: [
    (Story) => (
      <Card title="Acompanhamento">
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof TrackingStart>

export default meta

type Story = StoryObj<typeof meta>

export const NotTracked: Story = {}

export const Opening: Story = {
  args: { opening: true },
}

export const LimitReached: Story = {
  args: { failure: { message: 'Limite de 10 acompanhamentos atingido.', canRetry: false, placement: 'below' } },
}

export const InsufficientInformation: Story = {
  args: {
    failure: {
      message: 'O jogador não tem dados suficientes para servir de linha de base.',
      canRetry: false,
      placement: 'below',
    },
  },
}

export const SourceDown: Story = {
  args: { failure: { message: 'Não foi possível acompanhar agora.', canRetry: true, placement: 'replace' } },
}
