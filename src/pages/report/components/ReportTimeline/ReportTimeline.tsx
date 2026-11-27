import type { ReactNode } from 'react'
import { StatusBadge } from '../../../../components/StatusBadge/StatusBadge'
import type { TimelineGroup, TimelineItem } from '../../interfaces/report'
import styles from './ReportTimeline.module.css'

export interface ReportLinkProps {
  className: string
  children: ReactNode
}

interface ReportTimelineProps {
  groups: TimelineGroup[]
  renderLink: (item: TimelineItem, props: ReportLinkProps) => ReactNode
}

const CONTINUE_LABEL = 'Continuar'

export const ReportTimeline = ({ groups, renderLink }: ReportTimelineProps) => (
  <div className={styles.timeline}>
    {groups.map((group) => (
      <ol key={group.id} className={styles.group} aria-label={group.label}>
        {group.items.map((item, index) => (
          <li key={item.id} className={[styles.item, index > 0 && styles.correction].filter(Boolean).join(' ')}>
            {renderLink(item, {
              className: styles.row,
              children: (
                <>
                  <span className={styles.main}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.detail}>{item.detail}</span>
                    {item.note && <span className={styles.note}>{item.note}</span>}
                  </span>
                  <span className={styles.aside}>
                    <StatusBadge tone={item.status} />
                    {item.status === 'draft' && <span className={styles.continue}>{CONTINUE_LABEL}</span>}
                  </span>
                </>
              ),
            })}
          </li>
        ))}
      </ol>
    ))}
  </div>
)
