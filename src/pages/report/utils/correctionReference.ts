import type { ReportResponse } from '../interfaces/report'
import { formatDate } from './reportDates'

export const correctionReference = (corrected: ReportResponse): string =>
  corrected.corrigeRelatorioId
    ? `Corrige a correção de ${formatDate(corrected.escritoEm)}`
    : `Corrige o relatório observado em ${formatDate(corrected.observadoEm)}`
