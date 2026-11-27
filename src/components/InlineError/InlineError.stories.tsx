import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { InlineError } from './InlineError'

const meta = { component: InlineError } satisfies Meta<typeof InlineError>

export default meta

type Story = StoryObj<typeof meta>

export const WithRetry: Story = {
  args: { message: 'Estatísticas indisponíveis no momento.', onRetry: fn() },
}

export const WithoutRetry: Story = {
  args: { message: 'Jogador não encontrado.' },
}

export const WithActionLabel: Story = {
  args: { message: 'Este relatório foi alterado em outra aba.', onRetry: fn(), actionLabel: 'Carregar a versão atual' },
}
