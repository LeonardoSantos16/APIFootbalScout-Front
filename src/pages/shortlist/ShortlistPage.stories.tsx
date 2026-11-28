import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SHORTLIST_IDS } from '../../mocks/fixtures/shortlists'
import { handlers } from '../../mocks/handlers'
import { profileNotFound } from '../../mocks/handlers/profile'
import {
  moveTargetOutOfOrder,
  shortlistPending,
  shortlistUnknownError,
  writePending,
} from '../../mocks/handlers/shortlists'
import { StoryShell } from '../../test/StoryShell'
import { ShortlistPage } from './ShortlistPage'

interface ScreenProps {
  shortlistId: string
}

const Screen = ({ shortlistId }: ScreenProps) => (
  <StoryShell shortlistsCurrent>
    <ShortlistPage
      shortlistId={shortlistId}
      renderListLink={(props) => <a href="#shortlists" {...props} />}
      renderSearchLink={(props) => <a href="#busca" {...props} />}
      renderPlayerLink={(playerId, name) => <a href={`#jogador-${playerId}`}>{name}</a>}
    />
  </StoryShell>
)

const meta = {
  title: 'Pages/ShortlistPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { shortlistId: SHORTLIST_IDS.laterais },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

const click = async (canvasElement: HTMLElement, name: string) => {
  const canvas = within(canvasElement)
  await userEvent.click(await canvas.findByRole('button', { name }))
  return canvas
}

export const Laterais: Story = {
  beforeEach({ msw }) {
    msw.use(...handlers)
  },
}

export const LateraisOnPhone: Story = { ...Laterais, globals: PHONE }

export const ProfilesNotFound: Story = {
  beforeEach({ msw }) {
    msw.use(profileNotFound, ...handlers)
  },
}

export const Empty: Story = { ...Laterais, args: { shortlistId: SHORTLIST_IDS.meias } }

export const Full: Story = { ...Laterais, args: { shortlistId: SHORTLIST_IDS.atacantes } }

export const Pending: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistPending, ...handlers)
  },
}

export const Moving: Story = {
  beforeEach({ msw }) {
    msw.use(...writePending, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const canvas = await click(canvasElement, 'Subir Diego Albuquerque')
    await expect(await canvas.findByText('Movendo para a prioridade 2…')).toBeInTheDocument()
  },
}

export const Removing: Story = {
  beforeEach({ msw }) {
    msw.use(...writePending, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const canvas = await click(canvasElement, 'Remover Miguel Torres')
    await expect(await canvas.findByText('Removendo…')).toBeInTheDocument()
  },
}

export const Refused: Story = {
  beforeEach({ msw }) {
    msw.use(moveTargetOutOfOrder, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const canvas = await click(canvasElement, 'Subir Rafael Montes')
    await expect(await canvas.findByText('Prioridade fora da ordem da lista.')).toBeInTheDocument()
  },
}

export const Conflict: Story = {
  ...Laterais,
  args: { shortlistId: SHORTLIST_IDS.conflito },
  play: async ({ canvasElement }) => {
    const canvas = await click(canvasElement, 'Descer Bruno Lacerda')
    await expect(
      await canvas.findByText('Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança.'),
    ).toBeInTheDocument()
  },
}

export const NotFound: Story = { ...Laterais, args: { shortlistId: SHORTLIST_IDS.missing } }

export const LoadError: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistUnknownError, ...handlers)
  },
}
