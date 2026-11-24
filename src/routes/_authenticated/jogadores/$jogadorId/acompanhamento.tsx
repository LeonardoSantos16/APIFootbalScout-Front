import { createFileRoute } from '@tanstack/react-router'
import { TrackingPage } from '../../../../pages/tracking/TrackingPage'
import { sliceToSearch } from '../../../../utils/slice'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/acompanhamento')({
  component: TrackingRoute,
})

function TrackingRoute() {
  const { jogadorId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <TrackingPage
      playerId={Number(jogadorId)}
      search={search}
      onSliceChange={(slice, options) =>
        navigate({ search: (prev) => ({ ...prev, ...sliceToSearch(slice) }), replace: options?.replace })
      }
    />
  )
}
