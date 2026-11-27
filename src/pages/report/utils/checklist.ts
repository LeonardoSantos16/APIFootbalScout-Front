import type { ChecklistItem, ReportForm } from '../interfaces/report'

export const buildChecklist = (_form: ReportForm): ChecklistItem[] => []

export const isComplete = (_items: ChecklistItem[]): boolean => true
