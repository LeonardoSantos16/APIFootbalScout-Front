import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  completeProfile,
  manyRecortesProfile,
  profileNotFound,
  profilePending,
  profileSourceDown,
  profileWithoutStats,
  sparseProfile,
} from '../../mocks/handlers/profile'
import { PlayerStoryShell } from '../../test/StoryShell'
import { ProfilePage } from './ProfilePage'

interface ScreenProps {
  playerId: number
}

const Screen = ({ playerId }: ScreenProps) => (
  <PlayerStoryShell playerId={playerId} tab="profile">
    <ProfilePage playerId={playerId} renderSliceLink={(slice, props) => <a href={`#${slice.competitionId}`} {...props} />} />
  </PlayerStoryShell>
)

const meta = {
  title: 'Pages/ProfilePage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001 },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

export const Complete: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile)
  },
}

export const CompleteOnPhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  beforeEach({ msw }) {
    msw.use(completeProfile)
  },
}

export const ManyRecortes: Story = {
  args: { playerId: 1006 },
  beforeEach({ msw }) {
    msw.use(manyRecortesProfile)
  },
}

export const Sparse: Story = {
  args: { playerId: 1007 },
  beforeEach({ msw }) {
    msw.use(sparseProfile)
  },
}

export const WithoutStats: Story = {
  args: { playerId: 1003 },
  beforeEach({ msw }) {
    msw.use(profileWithoutStats)
  },
}

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(profilePending)
  },
}

export const NotFound: Story = {
  args: { playerId: 1004 },
  beforeEach({ msw }) {
    msw.use(profileNotFound)
  },
}

export const SourceDown: Story = {
  beforeEach({ msw }) {
    msw.use(profileSourceDown)
  },
}
