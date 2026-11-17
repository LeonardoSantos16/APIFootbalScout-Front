import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '../../hooks/useSession'
import { HomePage } from '../../pages/home/HomePage'
import { TestPlayers } from '../../pages/home/TestPlayers'

export const Route = createFileRoute('/_authenticated/')({
  component: HomeRoute,
})

function HomeRoute() {
  const session = useSession()
  const showTestPlayers = import.meta.env.VITE_API_MOCK === 'true'
  return <HomePage name={session?.name ?? ''} testPlayers={showTestPlayers ? <TestPlayers /> : undefined} />
}
