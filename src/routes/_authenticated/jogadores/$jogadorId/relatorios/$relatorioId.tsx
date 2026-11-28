import { createFileRoute, notFound } from '@tanstack/react-router'
import { isUuid } from '../../../../../utils/routeParams'
import { ReportEditorRoute } from './-ReportEditorRoute'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/relatorios/$relatorioId')({
  beforeLoad: ({ params }) => {
    if (!isUuid(params.relatorioId)) throw notFound()
  },
  component: ReportRoute,
})

function ReportRoute() {
  const { jogadorId, relatorioId } = Route.useParams()

  return <ReportEditorRoute jogadorId={jogadorId} relatorioId={relatorioId} />
}
