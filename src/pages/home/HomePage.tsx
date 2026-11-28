import type { ReactNode } from 'react'
import { Card } from '../../components/Card/Card'
import type { RowLinkProps } from '../../components/RowList/RowList'
import { SearchField } from '../../components/SearchField/SearchField'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useSearchForm } from '../../hooks/useSearchForm'
import { documentTitle } from '../../utils/documentTitle'
import { HomeShortlists, type HomeLinkProps } from './components/HomeShortlists/HomeShortlists'
import styles from './HomePage.module.css'

const FIELD_LABEL = 'Nome do jogador'

interface HomePageProps {
  name: string
  onSearch: (term: string) => void
  renderShortlistLink: (shortlistId: string, props: RowLinkProps) => ReactNode
  renderListLink: (props: HomeLinkProps) => ReactNode
}

export const HomePage = ({ name, onSearch, renderShortlistLink, renderListLink }: HomePageProps) => {
  const form = useSearchForm({ onSearch })

  useDocumentTitle(documentTitle())

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.greeting}>
          <h1 className={styles.title}>Olá, {name.trim().split(/\s+/)[0]}.</h1>
          <SearchField label={FIELD_LABEL} placeholder={FIELD_LABEL} {...form} />
        </div>
      </Card>
      <HomeShortlists renderShortlistLink={renderShortlistLink} renderListLink={renderListLink} />
    </div>
  )
}
