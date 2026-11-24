import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { PlayerSearch } from '../../interfaces/slice'
import { completeProfile, profileWithoutStats } from '../../mocks/handlers/profile'
import {
  openTrackingInsufficientInformation,
  openTrackingLimitReached,
  openTrackingPending,
  openTrackingSourceDown,
  trackingMarketValueDown,
  trackingNoRelevantChange,
  trackingNotTracked,
  trackingOpenedToday,
  trackingPending,
  trackingSourceDown,
  trackingUnavailable,
  trackingWithChanges,
} from '../../mocks/handlers/tracking'
import { PlayerStoryShell } from '../../test/StoryShell'
import { sliceToSearch } from '../../utils/slice'
import { TrackingPage } from './TrackingPage'

interface ScreenProps {
  playerId: number
}

const BRASILEIRAO_2025: PlayerSearch = { competicao: 325, temporada: 72034, contexto: 'Clube' }

const Screen = ({ playerId }: ScreenProps) => {
  const [search, setSearch] = useState<PlayerSearch>(BRASILEIRAO_2025)
  return (
    <PlayerStoryShell playerId={playerId} tab="tracking">
      <TrackingPage
        playerId={playerId}
        search={search}
        onSliceChange={(slice) => setSearch((current) => ({ ...current, ...sliceToSearch(slice) }))}
      />
    </PlayerStoryShell>
  )
}

const meta = {
  title: 'Pages/TrackingPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001 },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

export const WithChanges: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingWithChanges)
  },
}

export const WithChangesPhone: Story = {
  globals: PHONE,
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingWithChanges)
  },
}

export const MarketValueDown: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingMarketValueDown)
  },
}

export const OpenedToday: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingOpenedToday)
  },
}

export const NoRelevantChange: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNoRelevantChange)
  },
}

export const Unavailable: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingUnavailable)
  },
}

export const NotTracked: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNotTracked)
  },
}

export const NotTrackedPhone: Story = {
  globals: PHONE,
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNotTracked)
  },
}

export const Opening: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNotTracked, openTrackingPending)
  },
}

export const LimitReached: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNotTracked, openTrackingLimitReached)
  },
}

export const InsufficientInformation: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNotTracked, openTrackingInsufficientInformation)
  },
}

export const OpeningSourceDown: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingNotTracked, openTrackingSourceDown)
  },
}

export const ReadingSourceDown: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingSourceDown)
  },
}

export const Pending: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, trackingPending)
  },
}

export const NoStats: Story = {
  beforeEach({ msw }) {
    msw.use(profileWithoutStats, trackingNotTracked)
  },
}
