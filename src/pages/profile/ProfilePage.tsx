import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { RowList, type RowLinkProps } from '../../components/RowList/RowList'
import { Skeleton } from '../../components/Skeleton/Skeleton'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import type { Slice } from '../../interfaces/slice'
import { marketValue } from './utils/marketValue'
import { playerData } from './utils/playerData'
import { sliceRows } from './utils/sliceRows'
import { transferRows } from './utils/transfers'
import styles from './ProfilePage.module.css'

const PAGE_TITLE = 'Perfil'
const SLICES_SHOWN = 10
const TRANSFERS_SHOWN = 5
const SLICE_COLUMNS = ['Jogos', 'Minutos', 'Gols', 'Assist.', 'Nota']

interface ProfilePageProps {
  playerId: number
  renderSliceLink: (slice: Slice, props: RowLinkProps) => ReactNode
}

const LoadingCard = ({ title, rows }: { title: string; rows: number }) => (
  <Card title={title}>
    <div className={styles.loading} aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={styles.loadingRow} />
      ))}
    </div>
  </Card>
)

export const ProfilePage = ({ playerId, renderSliceLink }: ProfilePageProps) => {
  const [today] = useState(() => new Date())
  const [allSlices, setAllSlices] = useState(false)
  const [allTransfers, setAllTransfers] = useState(false)
  const profile = usePlayerProfile(playerId)
  const name = profile.data?.details?.name

  useEffect(() => {
    document.title = name ?? PAGE_TITLE
  }, [name])

  if (!profile.data) {
    return (
      <PageColumns aside={<LoadingCard title="Valor de mercado" rows={1} />}>
        <div className={styles.main}>
          <LoadingCard title="Dados" rows={2} />
          <LoadingCard title="Recortes" rows={4} />
        </div>
      </PageColumns>
    )
  }

  const data = playerData(profile.data, today)
  const slices = sliceRows(profile.data)
  const transfers = transferRows(profile.data.historyTransfer)
  const value = profile.data.details ? marketValue(profile.data.details) : undefined
  const shownSlices = allSlices ? slices : slices.slice(0, SLICES_SHOWN)
  const shownTransfers = allTransfers ? transfers : transfers.slice(0, TRANSFERS_SHOWN)

  const aside = (
    <>
      {value && (
        <Card title="Valor de mercado">
          <div className={styles.value}>
            <span className={styles.money}>{value}</span>
            <span className={styles.label}>Estimativa da fonte</span>
          </div>
        </Card>
      )}
      {transfers.length > 0 && (
        <Card title="Transferências">
          <RowList
            ariaLabel="Transferências"
            rows={shownTransfers}
            footer={
              shownTransfers.length < transfers.length && (
                <Button onClick={() => setAllTransfers(true)}>
                  Mostrar todas as transferências ({transfers.length})
                </Button>
              )
            }
          />
        </Card>
      )}
    </>
  )

  return (
    <PageColumns aside={aside}>
      <div className={styles.main}>
        {data.length > 0 && (
          <Card title="Dados">
            <dl className={styles.data}>
              {data.map((item, index) => (
                <div key={`${item.label}-${index}`} className={styles.item}>
                  <dt className={styles.label}>{item.label}</dt>
                  <dd className={styles.itemValue}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
        <Card title="Recortes">
          {slices.length === 0 ? (
            <p className={styles.empty}>Sem estatísticas publicadas para este jogador.</p>
          ) : (
            <RowList
              ariaLabel="Recortes"
              titleLabel="Recorte"
              columns={SLICE_COLUMNS}
              rows={shownSlices}
              renderLink={(row, props) => renderSliceLink(row.slice, props)}
              footer={
                shownSlices.length < slices.length && (
                  <Button onClick={() => setAllSlices(true)}>Mostrar todos os recortes ({slices.length})</Button>
                )
              }
            />
          )}
        </Card>
      </div>
    </PageColumns>
  )
}
