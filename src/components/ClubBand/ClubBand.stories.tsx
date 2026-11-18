import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerPhoto } from '../PlayerPhoto/PlayerPhoto'
import { ClubBand } from './ClubBand'

const meta = {
  component: ClubBand,
  args: { name: 'Rafael Montes', subtitle: 'Meio-campo, 27 anos, Atlético Serrano' },
} satisfies Meta<typeof ClubBand>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPhoto: Story = { args: { photo: <PlayerPhoto name="Rafael Montes" /> } }

export const WithoutSubtitle: Story = { args: { subtitle: undefined } }

export const LongName: Story = { args: { name: 'Gabriel Henrique dos Santos Albuquerque' } }

export const Loading: Story = { args: { loading: true } }
