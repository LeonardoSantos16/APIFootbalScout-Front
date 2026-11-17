import { useEffect } from 'react'
import { APP_NAME } from '../../components/AppShell/AppShell'
import { Card } from '../../components/Card/Card'
import { SearchField } from '../../components/SearchField/SearchField'
import { useSearchForm } from '../../hooks/useSearchForm'
import styles from './HomePage.module.css'

const FIELD_LABEL = 'Nome do jogador'

interface HomePageProps {
  name: string
  onSearch: (term: string) => void
}

export const HomePage = ({ name, onSearch }: HomePageProps) => {
  const form = useSearchForm({ onSearch })

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.greeting}>
          <h1 className={styles.title}>Olá, {name.trim().split(/\s+/)[0]}.</h1>
          <SearchField label={FIELD_LABEL} placeholder={FIELD_LABEL} {...form} />
        </div>
      </Card>
    </div>
  )
}
