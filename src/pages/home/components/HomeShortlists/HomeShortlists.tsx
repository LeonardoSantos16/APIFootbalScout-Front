import type { ReactNode } from 'react'
import { describeError } from '../../../../api/errors'
import { linkButtonClassName } from '../../../../components/Button/buttonClassName'
import { Card } from '../../../../components/Card/Card'
import { InlineError } from '../../../../components/InlineError/InlineError'
import { RowList, type RowLinkProps } from '../../../../components/RowList/RowList'
import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import { useShortlists } from '../../../../hooks/useShortlists'
import { homeShortlists } from '../../utils/homeShortlists'
import styles from './HomeShortlists.module.css'

const TITLE = 'Suas shortlists'
const LOADING = 'Carregando shortlists'
const SKELETON_ROWS = 3

export interface HomeLinkProps {
  className: string
  children: ReactNode
}

interface HomeShortlistsProps {
  renderShortlistLink: (shortlistId: string, props: RowLinkProps) => ReactNode
  renderListLink: (props: HomeLinkProps) => ReactNode
}

export const HomeShortlists = ({ renderShortlistLink, renderListLink }: HomeShortlistsProps) => {
  const shortlists = useShortlists()

  const renderBody = () => {
    if (shortlists.isError && !shortlists.isFetching) {
      const { message, canRetry } = describeError(shortlists.error)
      return <InlineError message={message} onRetry={canRetry ? () => void shortlists.refetch() : undefined} />
    }
    if (!shortlists.data) {
      return (
        <ul role="status" aria-label={LOADING} className={styles.skeleton}>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <li key={index} className={styles.skeletonRow}>
              <Skeleton className={styles.skeletonTitle} />
              <Skeleton className={styles.skeletonDetail} />
            </li>
          ))}
        </ul>
      )
    }
    if (shortlists.data.length === 0) {
      return (
        <div className={styles.empty}>
          <p className={styles.message}>Você ainda não tem shortlists.</p>
          {renderListLink({ className: linkButtonClassName('secondary'), children: 'Criar shortlist' })}
        </div>
      )
    }
    const { rows, hasMore } = homeShortlists(shortlists.data)
    return (
      <RowList
        rows={rows}
        ariaLabel={TITLE}
        renderLink={(row, props) => renderShortlistLink(row.shortlistId, props)}
        footer={hasMore && renderListLink({ className: styles.allLink, children: 'Ver todas as shortlists' })}
      />
    )
  }

  return (
    <Card title={TITLE}>
      {renderBody()}
    </Card>
  )
}
