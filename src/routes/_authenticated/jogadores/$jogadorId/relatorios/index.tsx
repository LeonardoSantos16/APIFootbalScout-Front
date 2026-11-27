import { Link, createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '../../../../../pages/report/ReportsPage'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/relatorios/')({
  component: ReportsRoute,
})

function ReportsRoute() {
  const { jogadorId } = Route.useParams()

  return (
    <ReportsPage
      playerId={Number(jogadorId)}
      renderNewLink={(props) => (
        <Link to="/jogadores/$jogadorId/relatorios/novo" params={{ jogadorId }} search={(prev) => prev} {...props} />
      )}
      renderReportLink={(item, props) => (
        <Link
          to="/jogadores/$jogadorId/relatorios/$relatorioId"
          params={{ jogadorId, relatorioId: item.id }}
          search={(prev) => prev}
          {...props}
        />
      )}
    />
  )
}
