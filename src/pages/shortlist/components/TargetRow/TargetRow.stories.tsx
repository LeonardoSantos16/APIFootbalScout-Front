import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerPhoto } from '../../../../components/PlayerPhoto/PlayerPhoto'
import { TargetRow } from './TargetRow'

const meta = {
  component: TargetRow,
  args: {
    priority: 2,
    cost: '€12,5M',
    fallbackName: 'Jogador #1001',
    name: 'Rafael Montes',
    nameLink: <a href="#">Rafael Montes</a>,
    detail: 'Meio-campo, Atlético Serrano',
    photo: <PlayerPhoto name="Rafael Montes" size="small" />,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 760, padding: '8px 24px', background: 'var(--surface)', borderRadius: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TargetRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const First: Story = { args: { priority: 1, canMoveUp: false } }

export const Last: Story = { args: { priority: 4, canMoveDown: false } }

export const ProfileLoading: Story = { args: { loading: true } }

export const ProfileSourceDown: Story = {
  args: {
    priority: 4,
    cost: '€4,5M',
    fallbackName: 'Jogador #1009',
    name: undefined,
    nameLink: undefined,
    detail: undefined,
    photo: undefined,
    error: 'Não foi possível carregar o perfil agora.',
    onRetry: () => {},
  },
}

export const ProfileNotFound: Story = {
  args: {
    priority: 25,
    cost: '€9M',
    fallbackName: 'Jogador #2017',
    name: undefined,
    nameLink: undefined,
    detail: undefined,
    photo: undefined,
    error: 'Perfil não encontrado.',
    canMoveDown: false,
  },
}

export const Pending: Story = { args: { priority: 3, pending: 'Movendo para a prioridade 1…' } }

export const Removing: Story = { args: { pending: 'Removendo…' } }

export const Dragging: Story = { args: { priority: 3, dragging: true } }

export const Disabled: Story = { args: { disabled: true } }
