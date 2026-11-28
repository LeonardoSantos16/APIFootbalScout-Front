import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '../../hooks/useSession'
import { HomePage } from '../../pages/home/HomePage'

export const Route = createFileRoute('/_authenticated/')({
  component: HomeRoute,
})

function HomeRoute() {
  const session = useSession()
  const navigate = useNavigate()
  return (
    <HomePage
      name={session?.name ?? ''}
      onSearch={(termo) => void navigate({ to: '/busca', search: { termo } })}
      renderShortlistLink={(shortlistId, props) => <Link to="/shortlists/$shortlistId" params={{ shortlistId }} {...props} />}
      renderListLink={(props) => <Link to="/shortlists" {...props} />}
    />
  )
}
