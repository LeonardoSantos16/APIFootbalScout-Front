import { Link, createFileRoute } from '@tanstack/react-router'
import { ShortlistPage } from '../../../pages/shortlist/ShortlistPage'

export const Route = createFileRoute('/_authenticated/shortlists/$shortlistId')({
  component: ShortlistRoute,
})

function ShortlistRoute() {
  const { shortlistId } = Route.useParams()

  return (
    <ShortlistPage
      key={shortlistId}
      shortlistId={shortlistId}
      renderListLink={(props) => <Link to="/shortlists" {...props} />}
      renderSearchLink={(props) => <Link to="/busca" {...props} />}
      renderPlayerLink={(playerId, name) => (
        <Link to="/jogadores/$jogadorId" params={{ jogadorId: String(playerId) }}>
          {name}
        </Link>
      )}
    />
  )
}
