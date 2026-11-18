import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay } from 'msw'
import { useState } from 'react'
import type { PlayerSearch } from '../../interfaces/slice'
import { buildFullProfile } from '../../mocks/fixtures/profiles'
import {
  comparisonDivergentRecorte,
  comparisonIncompatiblePositions,
  comparisonInsufficientSample,
  comparisonOneSideRefused,
  comparisonPending,
  comparisonPlayerNotFound,
  comparisonRealizada,
  comparisonSourceDown,
  comparisonStatisticsNotFound,
  comparisonUnknownPosition,
} from '../../mocks/handlers/comparison'
import { completeProfile, profileWithoutStats } from '../../mocks/handlers/profile'
import { searchResults } from '../../mocks/handlers/search'
import { http } from '../../mocks/http'
import { PlayerStoryShell } from '../../test/StoryShell'
import { sliceToSearch } from '../../utils/slice'
import { ComparisonPage } from './ComparisonPage'

interface ScreenProps {
  playerId: number
  initialSearch?: PlayerSearch
}

const BRASILEIRAO_2025: PlayerSearch = { competicao: 325, temporada: 72034, contexto: 'Clube' }

const Screen = ({ playerId, initialSearch = BRASILEIRAO_2025 }: ScreenProps) => {
  const [search, setSearch] = useState<PlayerSearch>(initialSearch)
  return (
    <PlayerStoryShell playerId={playerId} tab="comparison">
      <ComparisonPage
        playerId={playerId}
        search={search}
        onSliceChange={(slice) => setSearch((current) => ({ ...current, ...sliceToSearch(slice) }))}
        onClear={() => setSearch(({ com: _ignored, ...rest }) => rest)}
        renderResultLink={(player, { onClick, ...props }) => (
          <a
            href="#comparacao"
            {...props}
            onClick={(event) => {
              event.preventDefault()
              onClick()
              setSearch((current) => ({ ...current, com: player.id }))
            }}
          />
        )}
      />
    </PlayerStoryShell>
  )
}

const meta = {
  title: 'Pages/ComparisonPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001 },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const withOther = (com: number) => ({ initialSearch: { ...BRASILEIRAO_2025, com } })

const pendingProfile = http.get('/api/Players/{id}/profile', async ({ response }) => {
  await delay('infinite')
  return response(200).json(buildFullProfile())
})

export const NoSecondPlayer: Story = {
  beforeEach({ msw }) {
    msw.use(completeProfile, searchResults)
  },
}

export const Realizada: Story = {
  args: withOther(1006),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonRealizada)
  },
}

export const Phone: Story = {
  args: withOther(1006),
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonRealizada)
  },
}

export const OneSideRefused: Story = {
  args: withOther(1005),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonOneSideRefused)
  },
}

export const IncompatiblePositions: Story = {
  args: withOther(1004),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonIncompatiblePositions)
  },
}

export const UnknownPosition: Story = {
  args: withOther(1007),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonUnknownPosition)
  },
}

export const InsufficientSample: Story = {
  args: withOther(1003),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonInsufficientSample)
  },
}

export const PagePlayerShort: Story = {
  args: { initialSearch: { competicao: 373, temporada: 72034, contexto: 'Clube', com: 1006 } },
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonInsufficientSample)
  },
}

export const DivergentRecorte: Story = {
  args: withOther(1006),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonDivergentRecorte)
  },
}

export const StatisticsNotFound: Story = {
  args: withOther(1002),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonStatisticsNotFound)
  },
}

export const PlayerNotFound: Story = {
  args: withOther(9999),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonPlayerNotFound)
  },
}

export const SourceDown: Story = {
  args: withOther(1006),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonSourceDown)
  },
}

export const Loading: Story = {
  args: withOther(1006),
  beforeEach({ msw }) {
    msw.use(completeProfile, comparisonPending)
  },
}

export const LoadingProfile: Story = {
  args: withOther(1006),
  beforeEach({ msw }) {
    msw.use(pendingProfile)
  },
}

export const WithoutStats: Story = {
  args: { playerId: 1003, initialSearch: { com: 1006 } },
  beforeEach({ msw }) {
    msw.use(profileWithoutStats)
  },
}
