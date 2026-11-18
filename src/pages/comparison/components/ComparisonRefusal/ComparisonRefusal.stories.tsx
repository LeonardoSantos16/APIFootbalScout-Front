import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../../../components/Button/Button'
import { ComparisonRefusal } from './ComparisonRefusal'

const meta = {
  component: ComparisonRefusal,
  args: { action: <Button>Escolher outro jogador</Button> },
} satisfies Meta<typeof ComparisonRefusal>

export default meta

type Story = StoryObj<typeof meta>

export const IncompatiblePositions: Story = {
  args: {
    players: [
      { name: 'Rafael Montes', position: 'Meio-campo' },
      { name: 'Pedro Nunes', position: 'Goleiro' },
    ],
    message: 'Goleiro e meio-campo não são comparáveis.',
  },
}

export const UnknownPosition: Story = {
  args: {
    players: [
      { name: 'Rafael Montes', position: 'Meio-campo' },
      { name: 'Miguel Torres', position: 'Posição não informada' },
    ],
    message: 'A fonte não informou a posição de Miguel Torres.',
  },
}

export const InsufficientSample: Story = {
  args: {
    players: [
      { name: 'Rafael Montes', position: 'Meio-campo' },
      { name: 'Lucas Prado', position: 'Defesa' },
    ],
    message: 'Lucas Prado não tem minutos suficientes nesta competição e temporada (mínimo 450 min).',
  },
}
