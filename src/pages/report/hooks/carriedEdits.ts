import type { ReportForm, WriteFailure } from '../interfaces/report'

export interface CarriedEdit {
  form: ReportForm
  failure?: WriteFailure
}

const carried = new Map<string, CarriedEdit>()

export const carryEdit = (reportId: string, edit: CarriedEdit) => {
  carried.set(reportId, edit)
}

export const peekCarriedEdit = (reportId: string | undefined): CarriedEdit | undefined =>
  reportId ? carried.get(reportId) : undefined

export const dropCarriedEdit = (reportId: string) => {
  carried.delete(reportId)
}
