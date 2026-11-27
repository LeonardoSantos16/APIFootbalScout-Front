import { NotePencilIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { linkButtonClassName } from '../../../../components/Button/buttonClassName'
import { Notice } from '../../../../components/Notice/Notice'
import { formatDecimal } from '../../../../utils/number'
import type { ReportResponse, ReportStatus } from '../../interfaces/report'
import { formatDate } from '../../utils/reportDates'
import { PointList } from '../PointList/PointList'
import styles from './ReportReading.module.css'

export interface ReadingLinkProps {
  className?: string
  children: ReactNode
}

export interface ReportReference {
  id: string
  text: string
}

interface ReportReadingProps {
  report: ReportResponse
  status: ReportStatus
  notice?: string
  replacedBy?: ReportReference
  pendingCorrectionId?: string
  renderReportLink: (reportId: string, props: ReadingLinkProps) => ReactNode
  renderCorrectionLink: (reportId: string, props: ReadingLinkProps) => ReactNode
}

const NO_POINTS = 'Nenhum ponto.'

const datesLine = (report: ReportResponse) =>
  [
    `Observado em ${formatDate(report.observadoEm)}`,
    report.finalizadoEm ? `finalizado em ${formatDate(report.finalizadoEm)}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')

export const ReportReading = ({
  report,
  status,
  notice,
  replacedBy,
  pendingCorrectionId,
  renderReportLink,
  renderCorrectionLink,
}: ReportReadingProps) => {
  const correctionAction = (children: ReactNode) => (
    <>
      <NotePencilIcon size={20} aria-hidden />
      {children}
    </>
  )

  return (
    <div className={styles.reading}>
      <p className={styles.dates}>{datesLine(report)}</p>
      {notice && <Notice>{notice}</Notice>}
      {replacedBy && (
        <p className={styles.replaced}>
          {renderReportLink(replacedBy.id, { className: styles.link, children: replacedBy.text })}
        </p>
      )}
      <div className={styles.conclusion}>
        <div className={styles.stat}>
          <span className={styles.value}>{report.nota == null ? '–' : `${formatDecimal(report.nota, 1)} de 10`}</span>
          <span className={styles.label}>Nota</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{report.parecer ?? '–'}</span>
          <span className={styles.label}>Parecer</span>
        </div>
      </div>
      <div className={styles.block}>
        <span className={styles.label}>Relato</span>
        <p className={styles.narrative}>{report.texto}</p>
      </div>
      <PointList label="Pontos positivos" items={report.pontosPositivos} readOnly emptyText={NO_POINTS} />
      <PointList label="Pontos negativos" items={report.pontosNegativos} readOnly emptyText={NO_POINTS} />
      {status === 'current' && (
        <div>
          {pendingCorrectionId
            ? renderReportLink(pendingCorrectionId, {
                className: linkButtonClassName('secondary'),
                children: correctionAction('Continuar correção'),
              })
            : renderCorrectionLink(report.relatorioId, {
                className: linkButtonClassName('secondary'),
                children: correctionAction('Criar correção'),
              })}
        </div>
      )}
    </div>
  )
}
