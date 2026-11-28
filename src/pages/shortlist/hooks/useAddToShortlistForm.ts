import { useState, type FormEvent } from 'react'
import type { AddFormChoices, MarketValue, ShortlistResponse } from '../interfaces/shortlist'
import { addedMessage } from '../utils/addOptions'
import { resolveAddForm } from '../utils/addForm'
import { parseMillions } from '../utils/cost'
import { writeErrorText } from '../utils/shortlistError'
import { useAddTarget } from './useAddTarget'

export interface AddedTarget {
  shortlistId: string
  message: string
}

export const useAddToShortlistForm = (
  shortlists: ShortlistResponse[],
  playerId: number,
  marketValue: MarketValue | null | undefined,
  initialShortlistId?: string,
) => {
  const add = useAddTarget()
  const [choices, setChoices] = useState<AddFormChoices>({ shortlistId: initialShortlistId })
  const [submitted, setSubmitted] = useState(false)
  const [added, setAdded] = useState<AddedTarget>()
  const view = resolveAddForm(shortlists, playerId, marketValue, choices)
  const parsed = parseMillions(view.cost)

  const choose = (change: AddFormChoices) => {
    setChoices((current) => ({ ...current, ...change }))
    add.reset()
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const { selected, currency, priority } = view
    if (!selected || !parsed.ok) return
    add.mutate(
      { shortlist: selected, playerId, priority: Number(priority), cents: parsed.cents, currency },
      {
        onSuccess: (shortlist) => {
          const target = shortlist.alvos.find((alvo) => alvo.jogadorId === playerId)
          setAdded({
            shortlistId: shortlist.shortlistId,
            message: addedMessage(shortlist.nome, target?.prioridade ?? Number(priority)),
          })
        },
      },
    )
  }

  return {
    view,
    added,
    pending: add.isPending,
    costError: submitted && !parsed.ok ? parsed.error : undefined,
    serverError: add.isError ? writeErrorText(add.error, 'dialog') : undefined,
    chooseShortlist: (shortlistId: string) => choose({ shortlistId }),
    changeCost: (cost: string) => choose({ cost }),
    changeCurrency: (currency: string) => choose({ currency, cost: view.cost }),
    changePriority: (value: string) =>
      view.selected && choose({ priority: { shortlistId: view.selected.shortlistId, value } }),
    submit,
  }
}
