import { Link, createFileRoute } from '@tanstack/react-router'
import { ShortlistsPage } from '../../../pages/shortlist/ShortlistsPage'

export const Route = createFileRoute('/_authenticated/shortlists/')({
  component: ShortlistsRoute,
})

function ShortlistsRoute() {
  const navigate = Route.useNavigate()

  return (
    <ShortlistsPage
      renderShortlistLink={(shortlistId, props) => (
        <Link to="/shortlists/$shortlistId" params={{ shortlistId }} {...props} />
      )}
      onCreated={(shortlist) => void navigate({ to: '/shortlists/$shortlistId', params: { shortlistId: shortlist.shortlistId } })}
    />
  )
}
