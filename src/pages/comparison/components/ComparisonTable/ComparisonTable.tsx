import type { ReactNode } from 'react'
import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import { ATTRIBUTE_LABEL, ATTRIBUTE_ORDER } from '../../../../utils/attributes'
import type { ComparisonColumn, ComparisonRow } from '../../interfaces/comparison'
import styles from './ComparisonTable.module.css'

interface ComparisonTableProps {
  columns?: [ComparisonColumn, ComparisonColumn]
  rows?: ComparisonRow[]
  footer?: ReactNode
}

const ColumnHeader = ({ column }: { column?: ComparisonColumn }) =>
  column ? (
    <>
      <span className={styles.name}>{column.name}</span>
      {column.detail && <span className={styles.detail}>{column.detail}</span>}
    </>
  ) : (
    <>
      <Skeleton className={styles.nameSkeleton} />
      <Skeleton className={styles.detailSkeleton} />
    </>
  )

export const ComparisonTable = ({ columns, rows, footer }: ComparisonTableProps) => {
  const loading = !rows

  const table = (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" className={styles.attributeHead}>
            Atributo
          </th>
          <th scope="col" className={styles.playerHead}>
            <ColumnHeader column={columns?.[0]} />
          </th>
          <th scope="col" className={styles.playerHead}>
            <ColumnHeader column={columns?.[1]} />
          </th>
        </tr>
      </thead>
      <tbody>
        {loading
          ? ATTRIBUTE_ORDER.map((type) => (
              <tr key={type}>
                <th scope="row" className={styles.attribute}>
                  {ATTRIBUTE_LABEL[type]}
                </th>
                <td className={styles.value}>
                  <Skeleton className={styles.valueSkeleton} />
                </td>
                <td className={styles.value}>
                  <Skeleton className={styles.valueSkeleton} />
                </td>
              </tr>
            ))
          : rows.map((row) => (
              <tr key={row.type}>
                <th scope="row" className={styles.attribute}>
                  {row.label}
                </th>
                {row.cells.map((cell, index) => (
                  <td key={index} className={`${styles.value} ${styles[cell.tone]}`} data-tone={cell.tone}>
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  )

  return (
    <div className={styles.wrap}>
      {loading ? (
        <div role="status" aria-label="Carregando comparação">
          {table}
        </div>
      ) : (
        table
      )}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
