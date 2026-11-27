import { Link, useBlocker, useNavigate } from '@tanstack/react-router'
import { useCallback, useRef } from 'react'
import { ReportEditorPage } from '../../../../../pages/report/ReportEditorPage'
import { LeaveDialog } from '../../../../../pages/report/components/LeaveDialog/LeaveDialog'

interface ReportEditorRouteProps {
  jogadorId: string
  relatorioId?: string
  corrige?: string
}

export const ReportEditorRoute = ({ jogadorId, relatorioId, corrige }: ReportEditorRouteProps) => {
  const navigate = useNavigate()
  const dirty = useRef(false)
  const onDirtyChange = useCallback((value: boolean) => {
    dirty.current = value
  }, [])
  const blocker = useBlocker({
    shouldBlockFn: () => dirty.current,
    enableBeforeUnload: () => dirty.current,
    withResolver: true,
  })

  return (
    <>
      <ReportEditorPage
        key={relatorioId ?? `novo-${corrige ?? ''}`}
        playerId={Number(jogadorId)}
        reportId={relatorioId}
        correctionOf={corrige}
        onDirtyChange={onDirtyChange}
        onCreated={(report) =>
          void navigate({
            to: '/jogadores/$jogadorId/relatorios/$relatorioId',
            params: { jogadorId, relatorioId: report.relatorioId },
            search: ({ corrige: _corrige, ...prev }) => prev,
            replace: true,
            ignoreBlocker: true,
          })
        }
        renderListLink={(props) => (
          <Link to="/jogadores/$jogadorId/relatorios" params={{ jogadorId }} search={(prev) => prev} {...props} />
        )}
        renderReportLink={(id, props) => (
          <Link
            to="/jogadores/$jogadorId/relatorios/$relatorioId"
            params={{ jogadorId, relatorioId: id }}
            search={({ corrige: _corrige, ...prev }) => prev}
            {...props}
          />
        )}
        renderCorrectionLink={(id, props) => (
          <Link
            to="/jogadores/$jogadorId/relatorios/novo"
            params={{ jogadorId }}
            search={(prev) => ({ ...prev, corrige: id })}
            {...props}
          />
        )}
      />
      <LeaveDialog open={blocker.status === 'blocked'} onLeave={() => blocker.proceed?.()} onStay={() => blocker.reset?.()} />
    </>
  )
}
