import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay } from 'msw'
import { useState } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import type { SliceSearch } from '../../interfaces/slice'
import { calculatedAttributes, metricsResponse } from '../../mocks/fixtures/metrics'
import { buildFullProfile } from '../../mocks/fixtures/profiles'
import {
  calculatedMetrics,
  incompleteMetrics,
  insufficientSampleMetrics,
  metricsSourceDown,
  metricsWithoutCode,
} from '../../mocks/handlers/metrics'
import {
  completeProfile,
  nationalTeamOnlyProfile,
  profileNotFound,
  profileSourceDown,
  profileWithoutStats,
} from '../../mocks/handlers/profile'
import { http } from '../../mocks/http'
import { sliceToSearch } from '../../utils/slice'
import { MetricsPage } from './MetricsPage'

interface ScreenProps {
  playerId: number
  initialSearch?: SliceSearch
}

const Screen = ({ playerId, initialSearch = {} }: ScreenProps) => {
  const [search, setSearch] = useState<SliceSearch>(initialSearch)
  return (
    <AppShell>
      <MetricsPage
        playerId={playerId}
        search={search}
        onSliceChange={(slice) => setSearch(sliceToSearch(slice))}
      />
    </AppShell>
  )
}

const meta = {
  title: 'Pages/MetricsPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001 },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const pendingProfile = http.get('/api/Players/{id}/profile', async ({ response }) => {
  await delay('infinite')
  return response(200).json(buildFullProfile())
})

const pendingMetrics = http.get('/api/Analise/{jogadorId}/metricas-por-90', async ({ response }) => {
  await delay('infinite')
  return response(200).json(metricsResponse(calculatedAttributes))
})

export const Success: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, calculatedMetrics)
  },
}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  beforeEach({ msw }) {
    msw.use(completeProfile, calculatedMetrics)
  },
}

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(pendingProfile, pendingMetrics)
  },
}

export const LoadingMetrics: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, pendingMetrics)
  },
}

export const NationalTeamOnly: Story = {
  args: { playerId: 1002 },
  beforeEach({ msw }) {
    msw.use(nationalTeamOnlyProfile, calculatedMetrics)
  },
}

export const WithoutStats: Story = {
  args: { playerId: 1003 },
  beforeEach({ msw }) {
    msw.use(profileWithoutStats)
  },
}

export const InsufficientSample: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, insufficientSampleMetrics)
  },
}

export const ProfileNotFound: Story = {
  args: { playerId: 1004 },
  beforeEach({ msw }) {
    msw.use(profileNotFound)
  },
}

export const ProfileSourceDown: Story = {
  beforeEach({ msw }) {
    msw.use(profileSourceDown)
  },
}

export const MetricsSourceDown: Story = {
  args: { playerId: 1005 },
  beforeEach({ msw }) {
    msw.use(completeProfile, metricsSourceDown)
  },
}

export const MetricsWithoutCode: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, metricsWithoutCode)
  },
}

export const IncompleteMetrics: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, incompleteMetrics)
  },
}
