import type { CSSProperties, ReactNode } from 'react'
import styles from './RowList.module.css'

export interface RowCell {
  value: ReactNode
  label?: string
  labelBefore?: boolean
}

export interface Row {
  id: string
  title: ReactNode
  detail?: ReactNode
  cells?: RowCell[]
}

export interface RowLinkProps {
  className: string
  children: ReactNode
}

interface RowListProps<T extends Row> {
  rows: T[]
  ariaLabel: string
  columns?: string[]
  titleLabel?: string
  footer?: ReactNode
  renderLink?: (row: T, props: RowLinkProps) => ReactNode
}

export const RowList = <T extends Row>({
  rows,
  ariaLabel,
  columns = [],
  titleLabel = '',
  footer,
  renderLink,
}: RowListProps<T>) => {
  const hasColumns = columns.length > 0
  const style = hasColumns ? ({ '--row-columns': columns.length } as CSSProperties) : undefined

  const body = (row: T) => (
    <>
      <span className={styles.main}>
        <span className={styles.title}>{row.title}</span>
        {row.detail && <span className={styles.detail}>{row.detail}</span>}
      </span>
      {hasColumns && (
        <span className={styles.cells}>
          {(row.cells ?? []).map((cell, index) => (
            <span key={index} className={styles.cell}>
              {cell.label && cell.labelBefore && <span className={styles.cellLabel}>{cell.label} </span>}
              {cell.value}
              {cell.label && !cell.labelBefore && <span className={styles.cellLabel}> {cell.label}</span>}
            </span>
          ))}
        </span>
      )}
    </>
  )

  return (
    <div className={[styles.rows, hasColumns && styles.withColumns].filter(Boolean).join(' ')} style={style}>
      {hasColumns && (
        <div className={[styles.row, styles.head].join(' ')} aria-hidden>
          <span className={styles.main}>{titleLabel}</span>
          <span className={styles.cells}>
            {columns.map((column) => (
              <span key={column} className={styles.cell}>
                {column}
              </span>
            ))}
          </span>
        </div>
      )}
      <ul className={styles.list} aria-label={ariaLabel}>
        {rows.map((row) => (
          <li key={row.id} className={styles.item}>
            {renderLink ? (
              renderLink(row, { className: [styles.row, styles.link].join(' '), children: body(row) })
            ) : (
              <div className={styles.row}>{body(row)}</div>
            )}
          </li>
        ))}
      </ul>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
