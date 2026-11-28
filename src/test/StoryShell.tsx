import type { ReactNode } from 'react'
import { AppShell } from '../components/AppShell/AppShell'
import { SearchField } from '../components/SearchField/SearchField'
import { PlayerLayout, type PlayerTab } from '../pages/player/PlayerLayout'

interface StoryShellProps {
  children: ReactNode
  withSearch?: boolean
  shortlistsCurrent?: boolean
}

export const StoryShell = ({ children, withSearch = true, shortlistsCurrent = false }: StoryShellProps) => (
  <AppShell
    shortlistsLink={
      <a href="#shortlists" aria-current={shortlistsCurrent ? 'page' : undefined}>
        Shortlists
      </a>
    }
    accountLink={<a href="#conta">Ana Ribeiro</a>}
    search={
      withSearch && (
        <SearchField
          label="Buscar jogador"
          placeholder="Buscar jogador"
          size="compact"
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
        />
      )
    }
    searchLink={withSearch && <a href="#busca">Buscar</a>}
  >
    {children}
  </AppShell>
)

interface PlayerStoryShellProps {
  playerId: number
  tab: PlayerTab
  bandAction?: ReactNode
  children?: ReactNode
}

export const PlayerStoryShell = ({ playerId, tab, bandAction, children }: PlayerStoryShellProps) => (
  <StoryShell>
    <PlayerLayout
      playerId={playerId}
      tab={tab}
      bandAction={bandAction}
      renderTabLink={(target, props) => <a href={`#${target}`} {...props} />}
      renderSearchLink={(className) => (
        <a href="#busca" className={className}>
          Buscar jogador
        </a>
      )}
    >
      {children}
    </PlayerLayout>
  </StoryShell>
)
