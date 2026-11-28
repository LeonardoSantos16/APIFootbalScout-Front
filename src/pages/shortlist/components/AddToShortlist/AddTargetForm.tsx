import { Button } from '../../../../components/Button/Button'
import { InlineError } from '../../../../components/InlineError/InlineError'
import { MoneyField } from '../../../../components/MoneyField/MoneyField'
import { Select } from '../../../../components/Select/Select'
import { useAddToShortlistForm } from '../../hooks/useAddToShortlistForm'
import { CURRENCIES } from '../../utils/cost'
import styles from './AddToShortlist.module.css'

const ADD = 'Adicionar'
const ADDING = 'Adicionando…'
const CANCEL = 'Cancelar'

type AddTargetFormProps = Omit<ReturnType<typeof useAddToShortlistForm>, 'added'> & {
  onCancel: () => void
}

export const AddTargetForm = ({
  view,
  pending,
  costError,
  serverError,
  chooseShortlist,
  changeCost,
  changeCurrency,
  changePriority,
  submit,
  onCancel,
}: AddTargetFormProps) => {
  const unavailable = pending || !view.selected

  return (
    <form className={styles.body} onSubmit={submit} noValidate>
      <Select
        label="Shortlist"
        options={view.options}
        value={view.selected?.shortlistId ?? ''}
        disabled={pending}
        onChange={chooseShortlist}
      />
      <MoneyField
        value={view.cost}
        onChange={changeCost}
        currency={view.currency}
        currencies={CURRENCIES}
        onCurrencyChange={changeCurrency}
        lockedCurrency={view.lockedCurrency}
        hint={view.currencyHint}
        error={costError}
        disabled={unavailable}
      />
      <Select
        label="Prioridade"
        options={view.priorityOptions}
        value={view.priority}
        disabled={unavailable}
        onChange={changePriority}
      />
      {serverError && <InlineError message={serverError} />}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          {CANCEL}
        </Button>
        <Button type="submit" variant="primary" disabled={unavailable}>
          {pending ? ADDING : ADD}
        </Button>
      </div>
    </form>
  )
}
