import { useEffect } from 'react'
import { Notice } from '../../components/Notice/Notice'
import type { SessionNotice } from '../../interfaces/session'
import { noticeText } from '../../utils/accountErrors'
import styles from '../../styles/accountForm.module.css'

const PAGE_TITLE = 'Entrar'

interface SignInPageProps {
  notice?: SessionNotice
}

export const SignInPage = ({ notice }: SignInPageProps) => {
  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  return (
    <>
      <h1 className={styles.title}>{PAGE_TITLE}</h1>
      {notice && <Notice>{noticeText(notice)}</Notice>}
    </>
  )
}
