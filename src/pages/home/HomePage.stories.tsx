import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { handlers } from '../../mocks/handlers'
import {
  shortlistsEmpty,
  shortlistsMoreThanFive,
  shortlistsPending,
  shortlistsSourceDown,
  shortlistsUnknownError,
} from '../../mocks/handlers/shortlists'
import { StoryShell } from '../../test/StoryShell'
import { HomePage } from './HomePage'

interface ScreenProps {
  onSearch: (term: string) => void
}

const Screen = ({ onSearch }: ScreenProps) => (
  <StoryShell>
    <HomePage
      name="Ana Ribeiro"
      onSearch={onSearch}
      renderShortlistLink={(shortlistId, props) => <a href={`#${shortlistId}`} {...props} />}
      renderListLink={(props) => <a href="#shortlists" {...props} />}
    />
  </StoryShell>
)

const meta = {
  title: 'Pages/HomePage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { onSearch: fn() },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

export const WithShortlists: Story = {
  beforeEach({ msw }) {
    msw.use(...handlers)
  },
}

export const WithShortlistsOnPhone: Story = { ...WithShortlists, globals: PHONE }

export const MoreThanFive: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsMoreThanFive)
  },
}

export const MoreThanFiveOnPhone: Story = { ...MoreThanFive, globals: PHONE }

export const Empty: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsEmpty)
  },
}

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsPending)
  },
}

export const UnknownError: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsUnknownError)
  },
}

export const SourceDown: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsSourceDown)
  },
}
