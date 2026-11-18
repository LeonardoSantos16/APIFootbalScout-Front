import { useEffect, type ReactNode } from 'react'
import { Card } from '../../components/Card/Card'
import { InlineError } from '../../components/InlineError/InlineError'
import { RowList, type Row, type RowLinkProps } from '../../components/RowList/RowList'
import { SearchField } from '../../components/SearchField/SearchField'
import { Skeleton } from '../../components/Skeleton/Skeleton'
import { useSearchForm } from '../../hooks/useSearchForm'
import { isSearchableTerm } from '../../utils/search'
import { useSearchPlayers } from '../../hooks/useSearchPlayers'
import { describeSearchError, resultSummary, type SearchPlayer } from '../../utils/searchResults'
import styles from './SearchPage.module.css'

const PAGE_TITLE = 'Buscar jogador'
const FIELD_LABEL = 'Nome do jogador'
const PLACEHOLDER_ROWS = 5

export interface SearchSearch {
  termo?: string
}

interface ResultRow extends Row {
  player: SearchPlayer
}

interface SearchPageProps {
  term?: string
  onSearch: (term: string) => void
  renderPlayerLink: (player: SearchPlayer, props: RowLinkProps) => ReactNode
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

export const SearchPage = ({ term, onSearch, renderPlayerLink }: SearchPageProps) => {
  const form = useSearchForm({ initialValue: term, onSearch })
  const searchable = isSearchableTerm(term)
  const search = useSearchPlayers(term)

  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  const renderResults = () => {
    if (!searchable) return null
    if (search.isError && !search.isFetching) {
      const { message, canRetry } = describeSearchError(search.error)
      return (
        <Card>
          <InlineError message={message} onRetry={canRetry ? () => void search.refetch() : undefined} />
        </Card>
      )
    }
    if (!search.data) {
      return (
        <Card>
          <Placeholder />
        </Card>
      )
    }
    if (search.data.length === 0) {
      return (
        <Card>
          <p className={styles.empty}>
            Nenhum jogador encontrado para "{term}". Confira a grafia ou busque pelo sobrenome.
          </p>
        </Card>
      )
    }
    const rows: ResultRow[] = search.data.map((player) => ({
      id: String(player.id),
      title: <span className={styles.name}>{player.name}</span>,
      detail: resultSummary(player) || undefined,
      player,
    }))
    return (
      <Card>
        <div className={styles.results}>
          <RowList ariaLabel="Resultados" rows={rows} renderLink={(row, props) => renderPlayerLink(row.player, props)} />
        </div>
      </Card>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{PAGE_TITLE}</h1>
      <SearchField label={FIELD_LABEL} placeholder={FIELD_LABEL} autoFocus={!term} {...form} />
      {renderResults()}
    </div>
  )
}
