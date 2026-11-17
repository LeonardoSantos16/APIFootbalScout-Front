import { Link, createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '../../../../pages/profile/ProfilePage'
import { sliceToSearch } from '../../../../utils/slice'

export const Route = createFileRoute('/_authenticated/jogadores/$jogadorId/')({
  component: ProfileRoute,
})

function ProfileRoute() {
  const { jogadorId } = Route.useParams()

  return (
    <ProfilePage
      playerId={Number(jogadorId)}
      renderSliceLink={(slice, props) => (
        <Link to="/jogadores/$jogadorId/metricas" params={{ jogadorId }} search={sliceToSearch(slice)} {...props} />
      )}
    />
  )
}
