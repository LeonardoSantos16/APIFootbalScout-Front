import { useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { describeError } from '../../api/errors'
import { Card } from '../../components/Card/Card'
import { ClubBand } from '../../components/ClubBand/ClubBand'
import { InlineError } from '../../components/InlineError/InlineError'
import { PlayerPhoto } from '../../components/PlayerPhoto/PlayerPhoto'
import { Tabs, type TabLinkProps } from '../../components/Tabs/Tabs'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import { playerSummary } from '../../utils/player'
import styles from './PlayerLayout.module.css'

export type PlayerTab = 'profile' | 'metrics' | 'comparison' | 'tracking' | 'reports'

const TABS: { id: PlayerTab; label: string; shortLabel?: string }[] = [
  { id: 'profile', label: 'Perfil' },
  { id: 'metrics', label: 'Métricas' },
  { id: 'comparison', label: 'Comparação' },
  { id: 'tracking', label: 'Acompanhamento', shortLabel: 'Acompanh.' },
  { id: 'reports', label: 'Relatórios' },
]

const TAB_TITLE: Record<PlayerTab, string> = {
  profile: 'Perfil',
  metrics: 'Métricas por 90',
  comparison: 'Comparação',
  tracking: 'Acompanhamento',
  reports: 'Relatórios',
}

const NOT_FOUND_TITLE = 'Jogador não encontrado'

interface PlayerLayoutProps {
  playerId: number
  tab: PlayerTab
  renderTabLink: (tab: PlayerTab, props: TabLinkProps) => ReactNode
  renderSearchLink: (className: string) => ReactNode
  children?: ReactNode
}

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404

export const PlayerLayout = ({ playerId, tab, renderTabLink, renderSearchLink, children }: PlayerLayoutProps) => {
  const [today] = useState(() => new Date())
  const profile = usePlayerProfile(playerId)
  const failed = profile.isError && !profile.isFetching
  const notFound = failed && isNotFound(profile.error)

  useEffect(() => {
    if (failed) document.title = notFound ? NOT_FOUND_TITLE : TAB_TITLE[tab]
  }, [failed, notFound, tab])

  if (failed) {
    const { message, canRetry } = describeError(profile.error, { plainText: true })
    return (
      <div className={styles.layout}>
        <Card>
          <div className={styles.failure}>
            <InlineError message={message} onRetry={canRetry ? () => void profile.refetch() : undefined} />
            {notFound && renderSearchLink(styles.searchLink)}
          </div>
        </Card>
      </div>
    )
  }

  const details = profile.data?.details
  const name = details?.name ?? ''
  const tabs = (
    <Tabs
      items={TABS}
      value={tab}
      ariaLabel="Abas do jogador"
      disabled={!profile.data}
      renderLink={(item, props) => renderTabLink(item.id as PlayerTab, props)}
    />
  )

  return (
    <div className={styles.layout}>
      <div className={styles.band}>
        {profile.data ? (
          <ClubBand
            name={name}
            subtitle={details ? playerSummary(details, today) || undefined : undefined}
            photo={<PlayerPhoto name={name} src={profile.data.playerImage} />}
          />
        ) : (
          <ClubBand loading />
        )}
      </div>
      {tabs}
      {children}
    </div>
  )
}
