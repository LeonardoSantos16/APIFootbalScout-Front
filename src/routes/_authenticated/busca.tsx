import { Link, createFileRoute } from '@tanstack/react-router'
import { SearchPage, type SearchSearch } from '../../pages/search/SearchPage'
import { normalizeTerm } from '../../utils/search'

export const Route = createFileRoute('/_authenticated/busca')({
  validateSearch: (search: Record<string, unknown>): SearchSearch => ({
    termo: normalizeTerm(search.termo),
  }),
  component: SearchRoute,
})

function SearchRoute() {
  const { termo } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <SearchPage
      key={termo ?? ''}
      term={termo}
      onSearch={(term) => void navigate({ search: { termo: term } })}
      renderPlayerLink={(player, props) => (
        <Link to="/jogadores/$jogadorId" params={{ jogadorId: String(player.id) }} {...props} />
      )}
    />
  )
}
