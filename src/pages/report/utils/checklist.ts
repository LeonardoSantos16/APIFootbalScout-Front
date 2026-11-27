import { MIN_NEGATIVE_POINTS, MIN_POINTS_CHARACTERS, MIN_POSITIVE_POINTS } from '../../../config/scout'
import type { ChecklistItem, ReportForm } from '../interfaces/report'
import { cleanPoints, parseRating } from './reportForm'

const countItem = (label: string, count: number, minimum: number): ChecklistItem => ({
  label,
  done: count >= minimum,
  progress: `${count} de ${minimum}`,
})

export const buildChecklist = (form: ReportForm): ChecklistItem[] => {
  const positivePoints = cleanPoints(form.positivePoints)
  const negativePoints = cleanPoints(form.negativePoints)
  const characters = [...positivePoints, ...negativePoints].reduce((total, point) => total + point.length, 0)

  return [
    { label: 'Nota', done: parseRating(form.rating).kind === 'valid' },
    { label: 'Parecer', done: form.verdict !== null },
    countItem(`${MIN_POSITIVE_POINTS} pontos positivos`, positivePoints.length, MIN_POSITIVE_POINTS),
    countItem(`${MIN_NEGATIVE_POINTS} pontos negativos`, negativePoints.length, MIN_NEGATIVE_POINTS),
    countItem(`${MIN_POINTS_CHARACTERS} caracteres nos pontos`, characters, MIN_POINTS_CHARACTERS),
  ]
}

export const isComplete = (items: ChecklistItem[]): boolean => items.every((item) => item.done)
