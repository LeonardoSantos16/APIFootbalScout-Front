import type { ReactNode } from 'react'
import { AppShell } from '../components/AppShell/AppShell'
import { SearchField } from '../components/SearchField/SearchField'
import { PlayerLayout, type PlayerTab } from '../pages/player/PlayerLayout'

interface StoryShellProps {
  children: ReactNode
  withSearch?: boolean
}

export const StoryShell = ({ children, withSearch = true }: StoryShellProps) => (
  <AppShell
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
  children: ReactNode
}

export const PlayerStoryShell = ({ playerId, tab, children }: PlayerStoryShellProps) => (
  <StoryShell>
    <PlayerLayout
      playerId={playerId}
      tab={tab}
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
