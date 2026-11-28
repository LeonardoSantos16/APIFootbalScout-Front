import type { ReactNode } from 'react'
import { Card } from '../../components/Card/Card'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { documentTitle } from '../../utils/documentTitle'
import styles from './NotFoundPage.module.css'

const PAGE_TITLE = 'Página não encontrada'

interface NotFoundPageProps {
  action: ReactNode
  framed?: boolean
}

export const NotFoundPage = ({ action, framed = false }: NotFoundPageProps) => {
  useDocumentTitle(documentTitle(PAGE_TITLE))

  const content = (
    <div className={framed ? styles.framed : styles.content}>
      <h1 className={styles.title}>{PAGE_TITLE}.</h1>
      <p className={styles.text}>O endereço não existe ou foi digitado errado.</p>
      <div>{action}</div>
    </div>
  )

  return framed ? (
    <div className={styles.page}>
      <Card>{content}</Card>
    </div>
  ) : (
    content
  )
}
