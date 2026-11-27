import { createFileRoute } from '@tanstack/react-router'
import { ReportEditorRoute } from './-ReportEditorRoute'

interface NewReportSearch {
  corrige?: string
}

const validateNewReportSearch = (search: Record<string, unknown>): NewReportSearch =>
  typeof search.corrige === 'string' && search.corrige ? { corrige: search.corrige } : {}

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/relatorios/novo')({
  validateSearch: validateNewReportSearch,
  component: NewReportRoute,
})

function NewReportRoute() {
  const { jogadorId } = Route.useParams()
  const { corrige } = Route.useSearch()

  return <ReportEditorRoute jogadorId={jogadorId} corrige={corrige} />
}
