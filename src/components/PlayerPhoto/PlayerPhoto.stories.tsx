import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerPhoto } from './PlayerPhoto'

const meta = {
  component: PlayerPhoto,
  args: { name: 'Rafael Silva' },
} satisfies Meta<typeof PlayerPhoto>

export default meta

type Story = StoryObj<typeof meta>

export const Initials: Story = {}

export const BrokenImage: Story = { args: { src: 'imagem-que-nao-existe.png' } }

export const Small: Story = { args: { name: 'Caio Ventura', size: 'small' } }
