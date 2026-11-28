import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { describeError } from '../../api/errors'
import { Button } from '../../components/Button/Button'
import { linkButtonClassName } from '../../components/Button/buttonClassName'
import { Card } from '../../components/Card/Card'
import { Dialog } from '../../components/Dialog/Dialog'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { Skeleton } from '../../components/Skeleton/Skeleton'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import styles from './ReportEditorPage.module.css'
import { documentTitle } from '../../utils/documentTitle'
import { ReportActions, type PendingAction } from './components/ReportActions/ReportActions'
import { ReportForm, type ObservationMode } from './components/ReportForm/ReportForm'
import { ReportReading, type ReadingLinkProps, type ReportReference } from './components/ReportReading/ReportReading'
import { carryEdit, dropCarriedEdit, peekCarriedEdit } from './hooks/carriedEdits'
import { CreatedButNotCompletedError } from './hooks/reportQueries'
import { useFinalizeReport } from './hooks/useFinalizeReport'
import { useReport } from './hooks/useReport'
import { useReports } from './hooks/useReports'
import { useSaveReport } from './hooks/useSaveReport'
import type { ReportForm as ReportFormValue, ReportResponse, ReportStatus, WriteFailure } from './interfaces/report'
import { buildChecklist, isComplete } from './utils/checklist'
import { correctionReference } from './utils/correctionReference'
import { toInputDate, todayInput } from './utils/reportDates'
import { describeWriteError, isAlreadyFinalized, isConflict } from './utils/reportError'
import { emptyForm, isDirty, toForm, validateForm } from './utils/reportForm'

const REPORT_TITLE = 'Relatório'
const CORRECTION_TITLE = 'Correção'
const LOADING = 'Carregando relatório'
const NOT_FOUND = 'Relatório não encontrado.'
const BACK_TO_LIST = 'Voltar aos relatórios'
const ALREADY_FINALIZED = 'Este relatório já foi finalizado.'
const FINALIZE_TITLE = 'Finalizar relatório?'
const FINALIZE_DESCRIPTION = 'Depois de finalizado, o relatório não muda mais. Para ajustar, crie uma correção.'

export interface ReportEditorPageProps {
  playerId: number
  reportId?: string
  correctionOf?: string
  renderListLink: (props: ReadingLinkProps & { 'aria-label'?: string }) => ReactNode
  renderReportLink: (reportId: string, props: ReadingLinkProps) => ReactNode
  renderCorrectionLink: (reportId: string, props: ReadingLinkProps) => ReactNode
  onCreated: (report: ReportResponse) => void
  onDirtyChange?: (dirty: boolean) => void
}

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404

const sameForm = (left: ReportFormValue, right: ReportFormValue) => JSON.stringify(left) === JSON.stringify(right)

interface HeaderProps {
  title: string
  status?: ReportStatus
  reference?: ReportReference
  renderListLink: ReportEditorPageProps['renderListLink']
  renderReportLink: ReportEditorPageProps['renderReportLink']
}

const ReportHeader = ({ title, status, reference, renderListLink, renderReportLink }: HeaderProps) => (
  <div className={styles.header}>
    {renderListLink({
      className: styles.back,
      'aria-label': BACK_TO_LIST,
      children: (
        <>
          <ArrowLeftIcon size={20} aria-hidden />
          Relatórios
        </>
      ),
    })}
    <div className={styles.titleLine}>
      <h2 className={styles.title}>{title}</h2>
      {status && <StatusBadge tone={status} />}
    </div>
    {reference && (
      <p className={styles.reference}>
        {renderReportLink(reference.id, { className: styles.referenceLink, children: reference.text })}
      </p>
    )}
  </div>
)

interface EditorProps {
  playerId: number
  saved?: ReportResponse
  initialForm: ReportFormValue
  initialFailure?: WriteFailure
  correctionOf?: string
  observationMode: ObservationMode
  today: string
  header: ReactNode
  onCreated: (report: ReportResponse) => void
  onReload: () => void
  onAlreadyFinalized: () => void
  onDirtyChange?: (dirty: boolean) => void
}

const ReportEditor = ({
  playerId,
  saved,
  initialForm,
  initialFailure,
  correctionOf,
  observationMode,
  today,
  header,
  onCreated,
  onReload,
  onAlreadyFinalized,
  onDirtyChange,
}: EditorProps) => {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [failure, setFailure] = useState(initialFailure)
  const [conflict, setConflict] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const save = useSaveReport(playerId)
  const finalize = useFinalizeReport(playerId)

  const errors = submitted ? validateForm(form, saved) : {}
  const dirty = isDirty(saved, form)
  const blocking = dirty && (saved !== undefined || !sameForm(form, initialForm))
  const checklist = buildChecklist(form)
  const pending: PendingAction | undefined = save.isPending ? 'saving' : finalize.isPending ? 'finalizing' : undefined

  useEffect(() => {
    onDirtyChange?.(blocking)
  }, [blocking, onDirtyChange])

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange])

  const fail = (error: unknown) => {
    if (error instanceof CreatedButNotCompletedError) {
      carryEdit(error.created.relatorioId, { form, failure: describeWriteError(error.reason) })
      onCreated(error.created)
      return
    }
    if (isConflict(error)) setConflict(true)
    else if (isAlreadyFinalized(error)) onAlreadyFinalized()
    else setFailure(describeWriteError(error))
  }

  const valid = () => {
    setSubmitted(true)
    return Object.keys(validateForm(form, saved)).length === 0
  }

  const handlers = {
    onSuccess: (result: ReportResponse) => {
      if (!saved) {
        onCreated(result)
        return
      }
      setForm(toForm(result))
      setSubmitted(false)
    },
    onError: fail,
  }

  const onSave = () => {
    if (!valid()) return
    setFailure(undefined)
    save.mutate({ saved, form, correctionOf }, handlers)
  }

  const onConfirm = () => {
    setConfirming(false)
    setFailure(undefined)
    finalize.mutate({ saved, form, correctionOf }, handlers)
  }

  return (
    <>
      <PageColumns
        aside={
          <Card>
            <ReportActions
              checklist={checklist}
              canFinalize={isComplete(checklist)}
              dirty={dirty}
              pending={pending}
              conflict={conflict}
              failure={failure}
              onSave={onSave}
              onFinalize={() => valid() && setConfirming(true)}
              onReload={onReload}
            />
          </Card>
        }
      >
        <Card>
          <div className={styles.body}>
            {header}
            <ReportForm
              form={form}
              onChange={setForm}
              errors={errors}
              observationMode={observationMode}
              today={today}
              disabled={pending !== undefined}
            />
          </div>
        </Card>
      </PageColumns>
      <Dialog
        open={confirming}
        title={FINALIZE_TITLE}
        description={FINALIZE_DESCRIPTION}
        onClose={() => setConfirming(false)}
        actions={
          <>
            <Button onClick={() => setConfirming(false)}>Voltar</Button>
            <Button variant="primary" onClick={onConfirm}>
              Finalizar relatório
            </Button>
          </>
        }
      />
    </>
  )
}

const LoadingEditor = () => (
  <PageColumns>
    <Card>
      <div className={styles.loading} role="status" aria-label={LOADING}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonField} />
        <Skeleton className={styles.skeletonArea} />
        <Skeleton className={styles.skeletonField} />
      </div>
    </Card>
  </PageColumns>
)

export const ReportEditorPage = ({
  playerId,
  reportId,
  correctionOf,
  renderListLink,
  renderReportLink,
  renderCorrectionLink,
  onCreated,
  onDirtyChange,
}: ReportEditorPageProps) => {
  const [today] = useState(todayInput)
  const [carried] = useState(() => peekCarriedEdit(reportId))
  const [finalizedElsewhere, setFinalizedElsewhere] = useState(false)
  const [reloads, setReloads] = useState(0)
  const profile = usePlayerProfile(playerId)
  const reports = useReports(playerId)
  const report = useReport(playerId, reportId)
  const corrected = useReport(playerId, correctionOf)

  const saved = report.data
  const correctedId = saved?.corrigeRelatorioId ?? correctionOf
  const title = correctedId ? CORRECTION_TITLE : REPORT_TITLE
  const name = profile.data?.details?.name

  useEffect(() => {
    if (reportId) dropCarriedEdit(reportId)
  }, [reportId])

  useDocumentTitle(documentTitle(title, name))

  const item = reports.data?.groups.flatMap((group) => group.items).find((entry) => entry.id === reportId)
  const correctedReport = correctionOf
    ? corrected.data
    : reports.data?.reports.find((entry) => entry.relatorioId === saved?.corrigeRelatorioId)
  const reference = correctedReport
    ? { id: correctedReport.relatorioId, text: correctionReference(correctedReport) }
    : undefined

  const failedQuery = [report, corrected].find((query) => query.isError && !query.isFetching)

  if (failedQuery && isNotFound(failedQuery.error)) {
    return (
      <PageColumns>
        <Card title={REPORT_TITLE}>
          <div className={styles.notFound}>
            <p className={styles.notFoundText}>{NOT_FOUND}</p>
            <div>{renderListLink({ className: linkButtonClassName('secondary'), children: BACK_TO_LIST })}</div>
          </div>
        </Card>
      </PageColumns>
    )
  }

  if (failedQuery) {
    const { message, canRetry } = describeError(failedQuery.error)
    return (
      <PageColumns>
        <Card title={title}>
          <InlineError message={message} onRetry={canRetry ? () => void failedQuery.refetch() : undefined} />
        </Card>
      </PageColumns>
    )
  }

  if ((reportId && !saved) || (correctionOf && !corrected.data)) return <LoadingEditor />

  const header = (status?: ReportStatus) => (
    <ReportHeader
      title={title}
      status={status}
      reference={reference}
      renderListLink={renderListLink}
      renderReportLink={renderReportLink}
    />
  )

  if (saved?.status === 'Finalizado') {
    const status: ReportStatus = item && item.status !== 'draft' ? item.status : 'finalized'
    return (
      <PageColumns>
        <Card>
          <div className={styles.body}>
            {header(status)}
            <ReportReading
              report={saved}
              status={status}
              notice={finalizedElsewhere ? ALREADY_FINALIZED : undefined}
              replacedBy={item?.note && item.replacedById ? { id: item.replacedById, text: item.note } : undefined}
              pendingCorrectionId={item?.pendingCorrectionId}
              renderReportLink={renderReportLink}
              renderCorrectionLink={renderCorrectionLink}
            />
          </div>
        </Card>
      </PageColumns>
    )
  }

  const initialForm =
    carried?.form ??
    (saved
      ? toForm(saved)
      : emptyForm(corrected.data ? toInputDate(corrected.data.observadoEm) : today, corrected.data?.texto))
  const observationMode: ObservationMode = saved ? 'saved' : correctionOf ? 'inherited' : 'editable'

  return (
    <ReportEditor
      key={reloads}
      playerId={playerId}
      saved={saved}
      initialForm={initialForm}
      initialFailure={carried?.failure}
      correctionOf={saved ? undefined : correctionOf}
      observationMode={observationMode}
      today={today}
      header={header(saved ? 'draft' : undefined)}
      onCreated={onCreated}
      onReload={() => void report.refetch().then(() => setReloads((count) => count + 1))}
      onAlreadyFinalized={() => {
        setFinalizedElsewhere(true)
        void report.refetch()
      }}
      onDirtyChange={onDirtyChange}
    />
  )
}
