import { useEffect } from 'react'
import styles from '../../styles/accountForm.module.css'

const PAGE_TITLE = 'Conta'

export const AccountPage = () => {
  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  return <h1 className={styles.title}>{PAGE_TITLE}</h1>
}
