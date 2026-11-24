import type { Meta, StoryObj } from '@storybook/react-vite'
import { MeasurementCard, MeasurementCardSkeleton } from './MeasurementCard'

const meta = {
  component: MeasurementCard,
  args: {
    title: 'Valor de mercado',
    state: 'ComMudanca',
    previous: '€8M',
    current: '€9,6M',
    change: { direction: 'up', text: '+20,0% alta' },
  },
} satisfies Meta<typeof MeasurementCard>

export default meta

type Story = StoryObj<typeof meta>

export const MarketValueUp: Story = {}

export const MarketValueDown: Story = {
  args: {
    previous: '€12,5M',
    current: '€10M',
    change: { direction: 'down', text: '−20,0% queda' },
  },
}

export const ClubChanged: Story = {
  args: { title: 'Clube', previous: 'Vila Nova Paulista', current: 'Atlético Serrano', change: undefined },
}

export const MoreMinutes: Story = {
  args: {
    title: 'Minutagem',
    previous: '820',
    current: '1.240 min',
    change: { direction: 'up', text: '+420 min a mais' },
  },
}

export const NoRelevantChange: Story = {
  args: { state: 'SemMudancaRelevante', previous: undefined, current: '€4,5M', change: undefined },
}

export const CurrencyChanged: Story = {
  args: {
    state: 'Indisponivel',
    previous: undefined,
    current: undefined,
    change: undefined,
    reason: 'A fonte passou a publicar o valor em outra moeda; comparar seria enganoso.',
  },
}

export const SeasonTurned: Story = {
  args: {
    title: 'Minutagem',
    state: 'Indisponivel',
    previous: undefined,
    current: undefined,
    change: undefined,
    reason: 'A temporada virou e a minutagem zerou. A leitura antiga não é comparável.',
  },
}

export const Loading: Story = {
  render: () => <MeasurementCardSkeleton />,
}
