import type { FormErrors, RatingResult, ReportEdit, ReportForm, ReportResponse } from '../interfaces/report'
import { toInputDate } from './reportDates'

const MIN_RATING = 0
const MAX_RATING = 10

const NARRATIVE_REQUIRED = 'Escreva o relato.'
const RATING_OUT_OF_RANGE = 'A nota deve estar entre 0 e 10.'
const RATING_PRECISION = 'A nota aceita no máximo uma casa decimal.'
const RATING_REQUIRED = 'Informe a nota.'

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/
const TWO_DECIMALS_PATTERN = /\.\d{2,}$/

const RATING_INPUT_FORMAT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, useGrouping: false })

export const emptyForm = (today: string, narrative = ''): ReportForm => ({
  observation: today,
  narrative,
  rating: '',
  verdict: null,
  positivePoints: [],
  negativePoints: [],
})

export const toForm = (report: ReportResponse): ReportForm => ({
  observation: toInputDate(report.observadoEm),
  narrative: report.texto,
  rating: report.nota == null ? '' : RATING_INPUT_FORMAT.format(report.nota),
  verdict: report.parecer ?? null,
  positivePoints: [...report.pontosPositivos],
  negativePoints: [...report.pontosNegativos],
})

export const parseRating = (text: string): RatingResult => {
  const normalized = text.trim().replace(',', '.')
  if (!normalized) return { kind: 'empty' }
  if (!NUMBER_PATTERN.test(normalized)) return { kind: 'invalid', message: RATING_OUT_OF_RANGE }
  const value = Number(normalized)
  if (value < MIN_RATING || value > MAX_RATING) return { kind: 'invalid', message: RATING_OUT_OF_RANGE }
  if (TWO_DECIMALS_PATTERN.test(normalized)) return { kind: 'invalid', message: RATING_PRECISION }
  return { kind: 'valid', value }
}

export const cleanPoints = (points: string[]): string[] =>
  points.map((point) => point.trim()).filter((point) => point.length > 0)

const hasSavedRating = (saved?: ReportResponse) => saved?.nota != null

export const validateForm = (form: ReportForm, saved?: ReportResponse): FormErrors => {
  const errors: FormErrors = {}
  if (!form.narrative.trim()) errors.narrative = NARRATIVE_REQUIRED
  const rating = parseRating(form.rating)
  if (rating.kind === 'invalid') errors.rating = rating.message
  if (rating.kind === 'empty' && hasSavedRating(saved)) errors.rating = RATING_REQUIRED
  return errors
}

const samePoints = (left: string[], right: string[]) =>
  left.length === right.length && left.every((point, index) => point === right[index])

export const editPayload = (saved: ReportResponse, form: ReportForm): ReportEdit => {
  const payload: ReportEdit = {}
  if (form.narrative !== saved.texto) payload.texto = form.narrative
  const rating = parseRating(form.rating)
  if (rating.kind === 'valid' && rating.value !== saved.nota) payload.nota = rating.value
  if (form.verdict && form.verdict !== saved.parecer) payload.parecer = form.verdict
  const positivePoints = cleanPoints(form.positivePoints)
  if (!samePoints(positivePoints, saved.pontosPositivos)) payload.pontosPositivos = positivePoints
  const negativePoints = cleanPoints(form.negativePoints)
  if (!samePoints(negativePoints, saved.pontosNegativos)) payload.pontosNegativos = negativePoints
  return payload
}

export const isDirty = (saved: ReportResponse | undefined, form: ReportForm): boolean => {
  if (!saved) return true
  if (Object.keys(editPayload(saved, form)).length > 0) return true
  const rating = parseRating(form.rating)
  return rating.kind === 'invalid' || (rating.kind === 'empty' && hasSavedRating(saved))
}
