import type { FormErrors, RatingResult, ReportEdit, ReportForm, ReportResponse } from '../interfaces/report'

export const emptyForm = (today: string, narrative = ''): ReportForm => ({
  observation: today,
  narrative,
  rating: '',
  verdict: null,
  positivePoints: [],
  negativePoints: [],
})

export const toForm = (report: ReportResponse): ReportForm => emptyForm('', report.texto)

export const parseRating = (_text: string): RatingResult => ({ kind: 'empty' })

export const cleanPoints = (points: string[]): string[] => points

export const validateForm = (_form: ReportForm, _saved?: ReportResponse): FormErrors => ({})

export const editPayload = (_saved: ReportResponse, _form: ReportForm): ReportEdit => ({})

export const isDirty = (_saved: ReportResponse | undefined, _form: ReportForm): boolean => false
