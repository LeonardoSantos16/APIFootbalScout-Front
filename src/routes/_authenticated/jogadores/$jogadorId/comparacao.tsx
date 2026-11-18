import { Link, createFileRoute, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ComparisonPage } from '../../../../pages/comparison/ComparisonPage'
import { sliceToSearch } from '../../../../utils/slice'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/comparacao')({
  component: ComparisonRoute,
})

const isOtherPlayer = (value: unknown, playerId: number) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 && value !== playerId

function ComparisonRoute() {
  const { jogadorId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const playerId = Number(jogadorId)
  const rawCom = useRouterState({ select: (state) => (state.location.search as Record<string, unknown>).com })
  const invalidCom = rawCom !== undefined && !isOtherPlayer(rawCom, playerId)

  useEffect(() => {
    if (invalidCom) void navigate({ search: (prev) => ({ ...prev, com: undefined }), replace: true })
  }, [invalidCom, navigate])

  return (
    <ComparisonPage
      playerId={playerId}
      search={search}
      onSliceChange={(slice, options) =>
        navigate({ search: (prev) => ({ ...prev, ...sliceToSearch(slice) }), replace: options?.replace })
      }
      onClear={() => navigate({ search: (prev) => ({ ...prev, com: undefined }) })}
      renderResultLink={(player, props) => (
        <Link
          to="/jogadores/$jogadorId/comparacao"
          params={{ jogadorId }}
          search={(prev) => ({ ...prev, com: player.id })}
          {...props}
        />
      )}
    />
  )
}
