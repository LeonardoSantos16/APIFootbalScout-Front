import { createFileRoute } from '@tanstack/react-router'
import { MetricsPage } from '../../../pages/metrics/MetricsPage'
import { sliceToSearch, validateSliceSearch } from '../../../utils/slice'

export const Route = createFileRoute('/jogadores/$jogadorId/metricas')({
  validateSearch: validateSliceSearch,
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
      onSliceChange={(slice, options) => navigate({ search: sliceToSearch(slice), replace: options?.replace })}
    />
  )
}
