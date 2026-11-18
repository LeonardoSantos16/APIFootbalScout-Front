import { useNavigate } from '@tanstack/react-router'
import { useSearchForm } from '../../hooks/useSearchForm'
import { SearchField } from '../SearchField/SearchField'

const LABEL = 'Buscar jogador'

export const HeaderSearch = () => {
  const navigate = useNavigate()
  const form = useSearchForm({ onSearch: (termo) => void navigate({ to: '/busca', search: { termo } }) })

  return <SearchField label={LABEL} placeholder={LABEL} size="compact" {...form} />
}
