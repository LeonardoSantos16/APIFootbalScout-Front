import type { Meta, StoryObj } from '@storybook/react-vite'
import { completeProfile } from '../../mocks/handlers/profile'
import { reportsEmpty, reportsList, reportsPending, reportsUnknownError } from '../../mocks/handlers/reports'
import { PlayerStoryShell } from '../../test/StoryShell'
import { ReportsPage } from './ReportsPage'

interface ScreenProps {
  playerId: number
}

const Screen = ({ playerId }: ScreenProps) => (
  <PlayerStoryShell playerId={playerId} tab="reports">
    <ReportsPage
      playerId={playerId}
      renderNewLink={(props) => <a href="#novo" {...props} />}
      renderReportLink={(item, props) => <a href={`#${item.id}`} {...props} />}
    />
  </PlayerStoryShell>
)

const meta = {
  title: 'Pages/ReportsPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001 },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

export const Chain: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, reportsList)
  },
}

export const ChainOnPhone: Story = {
  ...Chain,
  globals: PHONE,
}

export const Empty: Story = {
  args: { playerId: 1003 },
  beforeEach({ msw }) {
    msw.use(completeProfile, reportsEmpty)
  },
}

export const ListError: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, reportsUnknownError)
  },
}

export const Pending: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, reportsPending)
  },
}
