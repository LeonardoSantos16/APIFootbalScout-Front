import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { handlers } from '../../mocks/handlers'
import {
  createShortlistPending,
  shortlistsEmpty,
  shortlistsPending,
  shortlistsUnknownError,
} from '../../mocks/handlers/shortlists'
import { StoryShell } from '../../test/StoryShell'
import { ShortlistsPage } from './ShortlistsPage'

interface ScreenProps {
  onCreated: () => void
}

const Screen = ({ onCreated }: ScreenProps) => (
  <StoryShell shortlistsCurrent>
    <ShortlistsPage
      renderShortlistLink={(shortlistId, props) => <a href={`#${shortlistId}`} {...props} />}
      onCreated={onCreated}
    />
  </StoryShell>
)

const meta = {
  title: 'Pages/ShortlistsPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { onCreated: fn() },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

export const List: Story = {
  beforeEach({ msw }) {
    msw.use(...handlers)
  },
}

export const ListOnPhone: Story = { ...List, globals: PHONE }

export const Empty: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsEmpty, ...handlers)
  },
}

export const Pending: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsPending, ...handlers)
  },
}

export const ListError: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsUnknownError, ...handlers)
  },
}

export const NameError: Story = {
  ...List,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Criar shortlist' }))
    await expect(await canvas.findByText('Dê um nome à shortlist.')).toBeInTheDocument()
  },
}

export const Creating: Story = {
  beforeEach({ msw }) {
    msw.use(createShortlistPending, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByRole('textbox', { name: 'Nome da shortlist' }), 'Volantes 2027')
    await userEvent.click(canvas.getByRole('button', { name: 'Criar shortlist' }))
    await expect(await canvas.findByRole('button', { name: 'Criando…' })).toBeDisabled()
  },
}
