import { useState, type ReactNode } from 'react'
import { InlineError } from '../../../../components/InlineError/InlineError'
import { RowList, type Row, type RowLinkProps } from '../../../../components/RowList/RowList'
import { SearchField } from '../../../../components/SearchField/SearchField'
import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import { useSearchForm } from '../../../../hooks/useSearchForm'
import { useSearchPlayers } from '../../../../hooks/useSearchPlayers'
import { isSearchableTerm } from '../../../../utils/search'
import { describeSearchError, resultSummary, type SearchPlayer } from '../../../../utils/searchResults'
import { comparableResults, filterNote, noComparableText } from '../../utils/candidates'
import styles from './CandidateSearch.module.css'

const FIELD_LABEL = 'Nome do jogador'
const PLACEHOLDER_ROWS = 5

export interface ResultLinkProps extends RowLinkProps {
  onClick: () => void
}

interface CandidateRow extends Row {
  player: SearchPlayer
}

interface CandidateSearchProps {
  pagePlayerId: number
  pagePlayerName: string
  pagePlayerLetter?: string | null
  initialTerm?: string
  onPick: (player: SearchPlayer) => void
  renderResultLink: (player: SearchPlayer, props: ResultLinkProps) => ReactNode
}

const Placeholder = () => (
  <div role="status" aria-label="Carregando resultados">
    <ul className={styles.placeholder}>
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
        <li key={index} className={styles.placeholderRow}>
          <Skeleton className={styles.placeholderName} />
          <Skeleton className={styles.placeholderDetail} />
        </li>
      ))}
    </ul>
  </div>
)

export const CandidateSearch = ({
  pagePlayerId,
  pagePlayerName,
  pagePlayerLetter,
  initialTerm,
  onPick,
  renderResultLink,
}: CandidateSearchProps) => {
  const [term, setTerm] = useState(initialTerm)
  const form = useSearchForm({ initialValue: initialTerm, onSearch: setTerm })
  const search = useSearchPlayers(term)

  const renderResults = () => {
    if (!isSearchableTerm(term)) return null
    if (search.isError && !search.isFetching) {
      const { message, canRetry } = describeSearchError(search.error)
      return <InlineError message={message} onRetry={canRetry ? () => void search.refetch() : undefined} />
    }
    if (!search.data) return <Placeholder />
    if (search.data.length === 0) {
      return (
        <p className={styles.empty}>
          Nenhum jogador encontrado para "{term}". Confira a grafia ou busque pelo sobrenome.
        </p>
      )
    }
    const candidates = comparableResults(search.data, pagePlayerId, pagePlayerLetter)
    if (candidates.length === 0) return <p className={styles.empty}>{noComparableText(pagePlayerLetter, term)}</p>

    const rows: CandidateRow[] = candidates.map((player) => ({
      id: String(player.id),
      title: <span className={styles.name}>{player.name}</span>,
      detail: resultSummary(player) || undefined,
      player,
    }))
    return (
      <div className={styles.results}>
        <p className={styles.note}>{filterNote(pagePlayerLetter)}</p>
        <RowList
          ariaLabel="Resultados"
          rows={rows}
          renderLink={(row, props) => renderResultLink(row.player, { ...props, onClick: () => onPick(row.player) })}
        />
      </div>
    )
  }

  return (
    <div className={styles.search}>
      <p className={styles.intro}>Escolha com quem comparar {pagePlayerName} nesta competição e temporada.</p>
      <SearchField label={FIELD_LABEL} placeholder={FIELD_LABEL} {...form} />
      {renderResults()}
    </div>
  )
}
