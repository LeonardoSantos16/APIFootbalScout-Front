import { ArrowLeftIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { type ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { describeError } from '../../api/errors'
import { linkButtonClassName } from '../../components/Button/buttonClassName'
import { Card } from '../../components/Card/Card'
import { Notice } from '../../components/Notice/Notice'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { documentTitle } from '../../utils/documentTitle'
import { ShortlistHeader } from './components/ShortlistHeader/ShortlistHeader'
import { ShortlistMessage } from './components/ShortlistMessage/ShortlistMessage'
import { TargetList } from './components/TargetList/TargetList'
import { TargetListSkeleton } from './components/TargetList/TargetListSkeleton'
import { useShortlist } from './hooks/useShortlist'
import { useTargetActions } from './hooks/useTargetActions'
import { useTargetProfiles } from './hooks/useTargetProfiles'
import type { ShortlistLinkProps } from './interfaces/shortlist'
import { fullText, isFull } from './utils/shortlists'
import styles from './ShortlistPage.module.css'

const PAGE_TITLE = 'Shortlist'
const BACK = 'Shortlists'
const NOT_FOUND = 'Shortlist não encontrada.'
const BACK_TO_LIST = 'Voltar às shortlists'
const EMPTY = 'Nenhum alvo ainda. Adicione jogadores pelo perfil.'
const SEARCH = 'Buscar jogador'
const LOADING = 'Carregando shortlist'

export interface ShortlistPageProps {
  shortlistId: string
  renderListLink: (props: ShortlistLinkProps) => ReactNode
  renderSearchLink: (props: ShortlistLinkProps) => ReactNode
  renderPlayerLink: (playerId: number, name: string) => ReactNode
}

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404

export const ShortlistPage = ({ shortlistId, renderListLink, renderSearchLink, renderPlayerLink }: ShortlistPageProps) => {
  const shortlist = useShortlist(shortlistId)
  const targets = shortlist.data?.alvos ?? []
  const profiles = useTargetProfiles(targets)
  const actions = useTargetActions(shortlistId)
  const name = shortlist.data?.nome

  useDocumentTitle(documentTitle(PAGE_TITLE, name))

  if (shortlist.isError && !shortlist.data && !shortlist.isFetching) {
    const notFound = isNotFound(shortlist.error)
    return (
      <PageColumns>
        <Card>
          <div className={styles.cardTop}>
            <ShortlistMessage
              text={notFound ? NOT_FOUND : describeError(shortlist.error).message}
              action={notFound && renderListLink({ className: linkButtonClassName('secondary'), children: BACK_TO_LIST })}
            />
          </div>
        </Card>
      </PageColumns>
    )
  }

  const renderTargets = () => {
    if (!shortlist.data) {
      return (
        <div role="status" aria-label={LOADING}>
          <TargetListSkeleton />
        </div>
      )
    }
    if (targets.length === 0) {
      return (
        <ShortlistMessage
          text={EMPTY}
          action={renderSearchLink({
            className: linkButtonClassName('secondary'),
            children: (
              <>
                <MagnifyingGlassIcon size={20} aria-hidden />
                {SEARCH}
              </>
            ),
          })}
        />
      )
    }
    return (
      <TargetList
        targets={targets}
        profiles={profiles}
        pending={actions.pending}
        locked={actions.locked}
        onWrite={actions.send}
        renderPlayerLink={renderPlayerLink}
      />
    )
  }

  return (
    <PageColumns>
      <div className={styles.page}>
        {renderListLink({
          className: styles.back,
          children: (
            <>
              <ArrowLeftIcon size={20} aria-hidden />
              {BACK}
            </>
          ),
        })}
        <ShortlistHeader shortlist={shortlist.data} />
        {shortlist.data && isFull(shortlist.data) && <Notice>{fullText(shortlist.data)}</Notice>}
        {actions.notice && <Notice>{actions.notice}</Notice>}
        <Card>
          <div className={styles.cardTop}>{renderTargets()}</div>
        </Card>
      </div>
    </PageColumns>
  )
}
