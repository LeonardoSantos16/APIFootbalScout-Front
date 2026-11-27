import { DateField } from '../../../../components/DateField/DateField'
import { SegmentedControl, type SegmentedOption } from '../../../../components/SegmentedControl/SegmentedControl'
import { TextArea } from '../../../../components/TextArea/TextArea'
import { TextField } from '../../../../components/TextField/TextField'
import { MIN_NEGATIVE_POINTS, MIN_POSITIVE_POINTS } from '../../../../config/scout'
import type { FormErrors, ReportForm as ReportFormValue, Verdict } from '../../interfaces/report'
import { cleanPoints } from '../../utils/reportForm'
import { PointList } from '../PointList/PointList'
import styles from './ReportForm.module.css'

export type ObservationMode = 'editable' | 'saved' | 'inherited'

const VERDICTS: SegmentedOption<Verdict>[] = [
  { value: 'Contratar', label: 'Contratar' },
  { value: 'Monitorar', label: 'Monitorar' },
  { value: 'Reavaliar', label: 'Reavaliar' },
  { value: 'Descartar', label: 'Descartar' },
]

const OBSERVATION_HINT: Record<ObservationMode, string | undefined> = {
  editable: undefined,
  saved: 'A data da observação não muda depois de salvar.',
  inherited: 'A correção mantém a data da observação do relatório corrigido.',
}

interface ReportFormProps {
  form: ReportFormValue
  onChange: (form: ReportFormValue) => void
  errors: FormErrors
  observationMode: ObservationMode
  today: string
  disabled?: boolean
}

export const ReportForm = ({ form, onChange, errors, observationMode, today, disabled }: ReportFormProps) => {
  const update = (patch: Partial<ReportFormValue>) => onChange({ ...form, ...patch })

  return (
    <div className={styles.form}>
      <DateField
        label="Data da observação"
        value={form.observation}
        max={today}
        readOnly={observationMode !== 'editable'}
        hint={OBSERVATION_HINT[observationMode]}
        disabled={disabled}
        onChange={(observation) => update({ observation })}
      />
      <TextArea
        label="Relato"
        value={form.narrative}
        error={errors.narrative}
        disabled={disabled}
        onChange={(event) => update({ narrative: event.target.value })}
      />
      <TextField
        className={styles.rating}
        label="Nota"
        inputMode="decimal"
        value={form.rating}
        hint="De 0 a 10, com uma casa decimal."
        error={errors.rating}
        disabled={disabled}
        onChange={(event) => update({ rating: event.target.value })}
      />
      <SegmentedControl
        label="Parecer"
        options={VERDICTS}
        value={form.verdict}
        disabled={disabled}
        onChange={(verdict) => update({ verdict })}
      />
      <PointList
        label="Pontos positivos"
        items={form.positivePoints}
        count={`${cleanPoints(form.positivePoints).length} de ${MIN_POSITIVE_POINTS}`}
        placeholder="Uma qualidade do jogador"
        disabled={disabled}
        onChange={(positivePoints) => update({ positivePoints })}
      />
      <PointList
        label="Pontos negativos"
        items={form.negativePoints}
        count={`${cleanPoints(form.negativePoints).length} de ${MIN_NEGATIVE_POINTS}`}
        placeholder="Um defeito do jogador"
        disabled={disabled}
        onChange={(negativePoints) => update({ negativePoints })}
      />
    </div>
  )
}
