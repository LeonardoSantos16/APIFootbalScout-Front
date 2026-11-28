import { Card } from '../../../../components/Card/Card'
import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import type { ShortlistResponse } from '../../interfaces/shortlist'
import { formatCost } from '../../utils/cost'
import { listCurrency, targetsCount } from '../../utils/shortlists'
import styles from './ShortlistHeader.module.css'

interface ShortlistHeaderProps {
  shortlist?: ShortlistResponse
}

interface Value {
  label: string
  value: string
}

const valuesOf = (shortlist: ShortlistResponse): Value[] => {
  const currency = listCurrency(shortlist)
  return [
    { label: 'Alvos', value: targetsCount(shortlist) },
    ...(shortlist.custoTotal ? [{ label: 'Custo total', value: formatCost(shortlist.custoTotal) }] : []),
    ...(currency ? [{ label: 'Moeda da lista', value: currency }] : []),
  ]
}

export const ShortlistHeader = ({ shortlist }: ShortlistHeaderProps) => (
  <Card>
    {shortlist ? (
      <div className={styles.header}>
        <h1 className={styles.name}>{shortlist.nome}</h1>
        <dl className={styles.values}>
          {valuesOf(shortlist).map((item) => (
            <div key={item.label} className={styles.item}>
              <dt className={styles.label}>{item.label}</dt>
              <dd className={styles.value}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    ) : (
      <div className={styles.header} aria-hidden>
        <Skeleton className={styles.skeletonName} />
        <div className={styles.values}>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className={styles.skeletonValue} />
          ))}
        </div>
      </div>
    )}
  </Card>
)
