import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricCell } from './MetricCell'

const meta = { component: MetricCell } satisfies Meta<typeof MetricCell>

export default meta

type Story = StoryObj<typeof meta>

export const Calculated: Story = {
  args: { state: 'calculated', label: 'Desarmes, por 90', value: '2,10' },
}

export const CalculatedWithOwnSample: Story = {
  args: { state: 'calculated', label: 'Precisão de passe', value: '86,4%', sample: '1.190 min jogados' },
}

export const RefusedForSample: Story = {
  args: { state: 'refused', label: 'Gols, por 90', reason: 'Amostra insuficiente: 312 de 450 min' },
}

export const RefusedBySource: Story = {
  args: { state: 'refused', label: 'Interceptações, por 90', reason: 'Não publicado pela fonte' },
}

export const Loading: Story = { args: { state: 'loading', label: 'Gols, por 90' } }
