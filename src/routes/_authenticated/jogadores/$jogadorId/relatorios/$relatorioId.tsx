import { createFileRoute } from '@tanstack/react-router'
import { ReportEditorRoute } from './-ReportEditorRoute'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/relatorios/$relatorioId')({
  component: ReportRoute,
})

function ReportRoute() {
  const { jogadorId, relatorioId } = Route.useParams()

  return <ReportEditorRoute jogadorId={jogadorId} relatorioId={relatorioId} />
}
