import { NotePencilIcon } from '@phosphor-icons/react'
import { type ReactNode } from 'react'
import { describeError } from '../../api/errors'
import { linkButtonClassName } from '../../components/Button/buttonClassName'
import { Card } from '../../components/Card/Card'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import styles from './ReportsPage.module.css'
import { documentTitle } from '../../utils/documentTitle'
import { ReportTimeline, type ReportLinkProps } from './components/ReportTimeline/ReportTimeline'
import { useReports } from './hooks/useReports'
import type { TimelineItem } from './interfaces/report'
import { ReportTimelineSkeleton } from './components/ReportTimeline/ReportTimelineSkeleton'

const PAGE_TITLE = 'Relatórios'
const NEW_REPORT = 'Escrever relatório'
const EMPTY = 'Nenhum relatório sobre este jogador.'
const LOADING = 'Carregando relatórios'

export interface NewReportLinkProps {
  className: string
  children: ReactNode
}

export interface ReportsPageProps {
  playerId: number
  renderNewLink: (props: NewReportLinkProps) => ReactNode
  renderReportLink: (item: TimelineItem, props: ReportLinkProps) => ReactNode
}

export const ReportsPage = ({ playerId, renderNewLink, renderReportLink }: ReportsPageProps) => {
  const profile = usePlayerProfile(playerId)
  const reports = useReports(playerId)
  const name = profile.data?.details?.name

  useDocumentTitle(documentTitle(PAGE_TITLE, name))

  const newLink = (variant: 'primary' | 'secondary') =>
    renderNewLink({
      className: linkButtonClassName(variant),
      children: (
        <>
          <NotePencilIcon size={20} aria-hidden />
          {NEW_REPORT}
        </>
      ),
    })

  const empty = reports.data?.groups.length === 0

  const renderBody = () => {
    if (reports.isError && !reports.isFetching) {
      const { message, canRetry } = describeError(reports.error)
      return <InlineError message={message} onRetry={canRetry ? () => void reports.refetch() : undefined} />
    }
    if (!reports.data) {
      return (
        <div role="status" aria-label={LOADING}>
          <ReportTimelineSkeleton />
        </div>
      )
    }
    if (empty) {
      return (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{EMPTY}</p>
          <div>{newLink('primary')}</div>
        </div>
      )
    }
    return <ReportTimeline groups={reports.data.groups} renderLink={renderReportLink} />
  }

  return (
    <PageColumns>
      <Card title={PAGE_TITLE} aside={empty ? undefined : newLink('secondary')}>
        {renderBody()}
      </Card>
    </PageColumns>
  )
}
