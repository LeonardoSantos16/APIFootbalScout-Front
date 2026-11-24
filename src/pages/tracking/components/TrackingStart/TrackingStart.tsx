import { Button } from '../../../../components/Button/Button'
import { InlineError } from '../../../../components/InlineError/InlineError'
import { Notice } from '../../../../components/Notice/Notice'
import { Select, type SelectOption } from '../../../../components/Select/Select'
import { SLICE_SELECT_LABEL } from '../../../../hooks/useSliceSelection'
import type { OpeningFailure } from '../../interfaces/tracking'
import styles from './TrackingStart.module.css'

const NOT_TRACKED = 'Você não acompanha este jogador.'
const BASELINE_HINT = 'Ao acompanhar, o clube, o valor de mercado e a minutagem de hoje viram a linha de base.'
const TRACK = 'Acompanhar'
const TRACKING = 'Acompanhando…'

interface TrackingStartProps {
  options: SelectOption[]
  value?: string
  onSelect: (value: string) => void
  onOpen: () => void
  opening?: boolean
  failure?: OpeningFailure
}

export const TrackingStart = ({ options, value, onSelect, onOpen, opening = false, failure }: TrackingStartProps) => {
  const replaced = failure?.placement === 'replace' && !opening

  return (
    <div className={styles.start}>
      <div className={styles.texts}>
        <p className={styles.lead}>{NOT_TRACKED}</p>
        <p className={styles.hint}>{BASELINE_HINT}</p>
      </div>
      <div className={styles.controls}>
        <Select label={SLICE_SELECT_LABEL} options={options} value={value} onChange={onSelect} disabled={opening} />
        {replaced ? (
          <InlineError message={failure.message} onRetry={failure.canRetry ? onOpen : undefined} />
        ) : (
          <Button variant="primary" className={styles.button} onClick={onOpen} disabled={opening}>
            {opening ? TRACKING : TRACK}
          </Button>
        )}
      </div>
      {failure?.placement === 'below' && !opening && <Notice>{failure.message}</Notice>}
    </div>
  )
}
