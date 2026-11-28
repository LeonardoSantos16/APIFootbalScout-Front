import { Link, Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { PlayerLayout, type PlayerTab } from '../../../pages/player/PlayerLayout'
import { AddToShortlist } from '../../../pages/shortlist/components/AddToShortlist/AddToShortlist'
import { validatePlayerSearch } from '../../../utils/slice'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId')({
  validateSearch: validatePlayerSearch,
  component: PlayerRoute,
})

const METRICS_SUFFIX = '/metricas'
const COMPARISON_SUFFIX = '/comparacao'
const TRACKING_SUFFIX = '/acompanhamento'
const REPORTS_SEGMENT = '/relatorios'

const TAB_ACTIVE = { exact: true, includeSearch: false }
const REPORTS_ACTIVE = { exact: false, includeSearch: false }

function PlayerRoute() {
  const { jogadorId } = Route.useParams()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const tab: PlayerTab = pathname.endsWith(METRICS_SUFFIX)
    ? 'metrics'
    : pathname.endsWith(COMPARISON_SUFFIX)
      ? 'comparison'
      : pathname.endsWith(TRACKING_SUFFIX)
        ? 'tracking'
        : pathname.includes(REPORTS_SEGMENT)
          ? 'reports'
          : 'profile'

  return (
    <PlayerLayout
      playerId={Number(jogadorId)}
      tab={tab}
      bandAction={
        <AddToShortlist
          playerId={Number(jogadorId)}
          renderShortlistLink={(shortlistId, props) => (
            <Link to="/shortlists/$shortlistId" params={{ shortlistId }} {...props} />
          )}
        />
      }
      renderTabLink={(target, props) =>
        target === 'reports' ? (
          <Link
            to="/jogadores/$jogadorId/relatorios"
            params={{ jogadorId }}
            search={(prev) => prev}
            activeOptions={REPORTS_ACTIVE}
            {...props}
          />
        ) : target === 'tracking' ? (
          <Link
            to="/jogadores/$jogadorId/acompanhamento"
            params={{ jogadorId }}
            search={(prev) => prev}
            activeOptions={TAB_ACTIVE}
            {...props}
          />
        ) : target === 'comparison' ? (
          <Link
            to="/jogadores/$jogadorId/comparacao"
            params={{ jogadorId }}
            search={(prev) => prev}
            activeOptions={TAB_ACTIVE}
            {...props}
          />
        ) : target === 'metrics' ? (
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
