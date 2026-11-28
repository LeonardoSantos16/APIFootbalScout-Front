import type { PriorityOption, ShortlistOption, ShortlistResponse } from '../interfaces/shortlist'
import { isFull, sortByName, targetsLabel } from './shortlists'

export const ALREADY_IN_SHORTLIST = 'Já está nesta shortlist'

const reasonOf = (shortlist: ShortlistResponse, playerId: number) => {
  if (isFull(shortlist)) return { text: `Cheia (${shortlist.alvos.length} de ${shortlist.limiteDeAlvos})`, disabled: true }
  if (shortlist.alvos.some((target) => target.jogadorId === playerId)) return { text: ALREADY_IN_SHORTLIST, disabled: true }
  return { text: targetsLabel(shortlist), disabled: false }
}

export const shortlistOptions = (shortlists: ShortlistResponse[], playerId: number): ShortlistOption[] =>
  sortByName(shortlists).map((shortlist) => {
    const reason = reasonOf(shortlist, playerId)
    return { value: shortlist.shortlistId, label: `${shortlist.nome} — ${reason.text}`, disabled: reason.disabled }
  })

export const defaultShortlist = (options: ShortlistOption[]): string | undefined =>
  options.find((option) => !option.disabled)?.value

const priorityLabel = (priority: number, last: number) => {
  if (priority === 1) return '1 — no topo'
  if (priority === last) return `${priority} — no fim`
  return String(priority)
}

export const priorityOptions = (count: number): PriorityOption[] =>
  Array.from({ length: count + 1 }, (_, index) => {
    const priority = index + 1
    return { value: String(priority), label: priorityLabel(priority, count + 1) }
  })

export const defaultPriority = (count: number): string => String(count + 1)

export const addedMessage = (name: string, priority: number): string =>
  `Adicionado a ${name}, na prioridade ${priority}.`
