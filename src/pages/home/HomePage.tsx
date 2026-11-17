import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { APP_NAME } from '../../components/AppShell/AppShell'
import { Card } from '../../components/Card/Card'
import styles from './HomePage.module.css'

interface HomePageProps {
  name: string
  testPlayers?: ReactNode
}

export const HomePage = ({ name, testPlayers }: HomePageProps) => {
  useEffect(() => {
    document.title = APP_NAME
  }, [])

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.greeting}>
          <h1 className={styles.title}>Olá, {name.trim().split(/\s+/)[0]}.</h1>
          <p className={styles.text}>A busca de jogadores chega em breve.</p>
        </div>
      </Card>
      {testPlayers && <Card title="Jogadores de teste">{testPlayers}</Card>}
    </div>
  )
}
