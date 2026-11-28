import { useEffect, type ReactNode } from 'react'
import { describeError } from '../../api/errors'
import { Card } from '../../components/Card/Card'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { RowList, type Row, type RowLinkProps } from '../../components/RowList/RowList'
import { Skeleton } from '../../components/Skeleton/Skeleton'
import { ShortlistNameForm } from './components/ShortlistNameForm/ShortlistNameForm'
import { useShortlists } from './hooks/useShortlists'
import type { ShortlistResponse } from './interfaces/shortlist'
import { formatCost } from './utils/cost'
import { targetsLabel } from './utils/shortlists'
import styles from './ShortlistsPage.module.css'

const PAGE_TITLE = 'Shortlists'
const EMPTY = 'Nenhuma shortlist ainda.'
const NO_TARGETS = 'Sem alvos'
const LOADING = 'Carregando shortlists'
const SKELETON_ROWS = 3

interface ShortlistRow extends Row {
  shortlistId: string
}

export interface ShortlistsPageProps {
  renderShortlistLink: (shortlistId: string, props: RowLinkProps) => ReactNode
  onCreated: (shortlist: ShortlistResponse) => void
}

const toRow = (shortlist: ShortlistResponse): ShortlistRow => ({
  id: shortlist.shortlistId,
  shortlistId: shortlist.shortlistId,
  title: shortlist.nome,
  detail: `${targetsLabel(shortlist)} · ${shortlist.custoTotal ? formatCost(shortlist.custoTotal) : NO_TARGETS}`,
})

export const ShortlistsPage = ({ renderShortlistLink, onCreated }: ShortlistsPageProps) => {
  const shortlists = useShortlists()

  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  const renderList = () => {
    if (shortlists.isError && !shortlists.isFetching) {
      return <p className={styles.message}>{describeError(shortlists.error).message}</p>
    }
    if (!shortlists.data) {
      return (
        <div role="status" aria-label={LOADING} className={styles.skeleton}>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className={styles.skeletonRow} />
          ))}
        </div>
      )
    }
    if (shortlists.data.length === 0) return <p className={styles.message}>{EMPTY}</p>
    return (
      <RowList
        rows={shortlists.data.map(toRow)}
        ariaLabel={PAGE_TITLE}
        renderLink={(row, props) => renderShortlistLink(row.shortlistId, props)}
      />
    )
  }

  return (
    <PageColumns>
      <div className={styles.page}>
        <h1 className={styles.title}>{PAGE_TITLE}</h1>
        <Card>
          <div className={styles.cardTop}>
            <ShortlistNameForm onCreated={onCreated} placeholder="Ex.: Volantes para 2027" />
          </div>
        </Card>
        <Card>
          <div className={styles.listTop}>{renderList()}</div>
        </Card>
      </div>
    </PageColumns>
  )
}
