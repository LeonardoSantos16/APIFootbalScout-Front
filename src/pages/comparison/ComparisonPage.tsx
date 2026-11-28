import { useState, type ReactNode } from 'react'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { Select } from '../../components/Select/Select'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { SLICE_SELECT_LABEL, useSliceSelection } from '../../hooks/useSliceSelection'
import type { PlayerSearch, Slice, SliceChangeOptions } from '../../interfaces/slice'
import { MINIMUM_RULE_TEXT } from '../../utils/attributes'
import { documentTitle } from '../../utils/documentTitle'
import type { SearchPlayer } from '../../utils/searchResults'
import { sliceText } from '../../utils/slice'
import styles from './ComparisonPage.module.css'
import { CandidateSearch, type ResultLinkProps } from './components/CandidateSearch/CandidateSearch'
import { ComparisonRefusal } from './components/ComparisonRefusal/ComparisonRefusal'
import { ComparisonTable } from './components/ComparisonTable/ComparisonTable'
import { useComparison } from './hooks/useComparison'
import { describeComparisonError } from './utils/comparisonError'
import { refusalMessage, refusedPlayers } from './utils/refusal'

const PAGE_TITLE = 'Comparação'
const CHANGE_PLAYER = 'Trocar jogador'
const PICK_ANOTHER = 'Escolher outro jogador'

export interface ComparisonPageProps {
  playerId: number
  search: PlayerSearch
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void
  onClear: () => void
  renderResultLink: (player: SearchPlayer, props: ResultLinkProps) => ReactNode
}

export const ComparisonPage = ({ playerId, search, onSliceChange, onClear, renderResultLink }: ComparisonPageProps) => {
  const { profile, slices, selected, options, value, select } = useSliceSelection(playerId, search, onSliceChange)
  const [chosenNames, setChosenNames] = useState<Record<number, string>>({})
  const otherId = search.com !== undefined && search.com !== playerId ? search.com : undefined
  const comparison = useComparison(playerId, otherId, selected)
  const details = profile.data?.details
  const name = details?.name

  useDocumentTitle(documentTitle(PAGE_TITLE, name))

  const remember = (player: SearchPlayer) => setChosenNames((names) => ({ ...names, [player.id]: player.name }))

  if (!profile.data) {
    return (
      <PageColumns>
        <Card title={PAGE_TITLE}>
          <div className={styles.content}>
            <Select label={SLICE_SELECT_LABEL} options={[]} loading />
            {otherId !== undefined && <ComparisonTable />}
          </div>
        </Card>
      </PageColumns>
    )
  }

  if (slices.length === 0) {
    return (
      <PageColumns>
        <Card title={PAGE_TITLE}>
          <p className={styles.empty}>Sem estatísticas publicadas para este jogador.</p>
        </Card>
      </PageColumns>
    )
  }

  const changeButton = (label: string, variant: 'secondary' | 'ghost') => (
    <Button variant={variant} onClick={onClear}>
      {label}
    </Button>
  )

  const renderComparison = (chosenId: number) => {
    if (!selected) return <ComparisonTable />

    if (comparison.isError && !comparison.isFetching) {
      const failure = describeComparisonError(comparison.error, {
        otherName: chosenNames[chosenId],
        sliceText: sliceText(selected),
      })
      if (failure.notFound) {
        return (
          <div className={styles.notice}>
            <p className={styles.message}>{failure.message}</p>
            <div>{changeButton(PICK_ANOTHER, 'secondary')}</div>
          </div>
        )
      }
      return (
        <div className={styles.failure}>
          <InlineError
            message={failure.message}
            onRetry={failure.canRetry ? () => void comparison.refetch() : undefined}
          />
          <div>{changeButton(CHANGE_PLAYER, 'ghost')}</div>
        </div>
      )
    }

    const result = comparison.data
    if (!result) return <ComparisonTable />

    const players = { pageId: playerId, otherId: chosenId }
    if (result.table) {
      return (
        <ComparisonTable
          columns={result.table.columns}
          rows={result.table.rows}
          footer={
            <>
              <p className={styles.rule}>{MINIMUM_RULE_TEXT}</p>
              {changeButton(CHANGE_PLAYER, 'ghost')}
            </>
          }
        />
      )
    }

    return (
      <ComparisonRefusal
        players={refusedPlayers(result.response, players)}
        message={refusalMessage(result.response, players, selected.minutesPlayed)}
        action={changeButton(PICK_ANOTHER, 'secondary')}
      />
    )
  }

  return (
    <PageColumns>
      <Card title={PAGE_TITLE}>
        <div className={styles.content}>
          <Select label={SLICE_SELECT_LABEL} options={options} value={value} onChange={select} />
          {otherId === undefined ? (
            <CandidateSearch
              pagePlayerId={playerId}
              pagePlayerName={name ?? ''}
              pagePlayerLetter={details?.position}
              onPick={remember}
              renderResultLink={renderResultLink}
            />
          ) : (
            renderComparison(otherId)
          )}
        </div>
      </Card>
    </PageColumns>
  )
}
