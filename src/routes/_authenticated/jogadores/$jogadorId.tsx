import { Link, Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { PlayerLayout, type PlayerTab } from '../../../pages/player/PlayerLayout'
import { validateSliceSearch } from '../../../utils/slice'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId')({
  validateSearch: validateSliceSearch,
  component: PlayerRoute,
})

const METRICS_SUFFIX = '/metricas'

const TAB_ACTIVE = { exact: true, includeSearch: false }

function PlayerRoute() {
  const { jogadorId } = Route.useParams()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const tab: PlayerTab = pathname.endsWith(METRICS_SUFFIX) ? 'metrics' : 'profile'

  return (
    <PlayerLayout
      playerId={Number(jogadorId)}
      tab={tab}
      renderTabLink={(target, props) =>
        target === 'metrics' ? (
          <Link
            to="/jogadores/$jogadorId/metricas"
            params={{ jogadorId }}
            search={(prev) => prev}
            activeOptions={TAB_ACTIVE}
            {...props}
          />
        ) : (
          <Link
            to="/jogadores/$jogadorId"
            params={{ jogadorId }}
            search={(prev) => prev}
            activeOptions={TAB_ACTIVE}
            {...props}
          />
        )
      }
      renderSearchLink={(className) => (
        <Link to="/busca" className={className}>
          Buscar jogador
        </Link>
      )}
    >
      <Outlet />
    </PlayerLayout>
  )
}
