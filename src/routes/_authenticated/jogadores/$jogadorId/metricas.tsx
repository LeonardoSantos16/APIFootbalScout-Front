import { createFileRoute } from '@tanstack/react-router'
import { MetricsPage } from '../../../../pages/metrics/MetricsPage'
import { sliceToSearch } from '../../../../utils/slice'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/metricas')({
  component: MetricsRoute,
})

function MetricsRoute() {
  const { jogadorId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <MetricsPage
      playerId={Number(jogadorId)}
      search={search}
      onSliceChange={(slice, options) => navigate({ search: (prev) => ({ ...prev, ...sliceToSearch(slice) }), replace: options?.replace })}
    />
  )
}
