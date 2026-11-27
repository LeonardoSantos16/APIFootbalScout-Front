import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { REPORT_IDS } from '../../mocks/fixtures/reports'
import { completeProfile } from '../../mocks/handlers/profile'
import {
  correctReportHandler,
  createReportHandler,
  editReportConflict,
  editReportHandler,
  editReportPending,
  editReportUnknownError,
  finalizeReportHandler,
  finalizeReportMinimumContent,
  reportCompleteDraft,
  reportFound,
  reportNotFound,
  reportPending,
  reportsList,
} from '../../mocks/handlers/reports'
import { PlayerStoryShell } from '../../test/StoryShell'
import { ReportEditorPage } from './ReportEditorPage'
import { LeaveDialog } from './components/LeaveDialog/LeaveDialog'

interface ScreenProps {
  playerId: number
  reportId?: string
  correctionOf?: string
}

const Screen = ({ playerId, reportId, correctionOf }: ScreenProps) => (
  <PlayerStoryShell playerId={playerId} tab="reports">
    <ReportEditorPage
      playerId={playerId}
      reportId={reportId}
      correctionOf={correctionOf}
      onCreated={fn()}
      renderListLink={(props) => <a href="#relatorios" {...props} />}
      renderReportLink={(id, props) => <a href={`#${id}`} {...props} />}
      renderCorrectionLink={(id, props) => <a href={`#novo?corrige=${id}`} {...props} />}
    />
  </PlayerStoryShell>
)

const meta = {
  title: 'Pages/ReportEditorPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001, reportId: REPORT_IDS.looseDraft },
  beforeEach({ msw }) {
    msw.use(
      completeProfile,
      reportsList,
      reportFound,
      createReportHandler,
      editReportHandler,
      finalizeReportHandler,
      correctReportHandler,
    )
  },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

const editNarrative = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  await userEvent.type(await canvas.findByLabelText('Relato'), ' Mais um detalhe.')
  return canvas
}

export const New: Story = { args: { reportId: undefined } }

export const SavedDraft: Story = {}

export const SavedDraftOnPhone: Story = { globals: PHONE }

export const WithChanges: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await editNarrative(canvasElement)
    await expect(canvas.getByText('Alterações não salvas')).toBeInTheDocument()
  },
}

export const Saving: Story = {
  beforeEach({ msw }) {
    msw.use(editReportPending)
  },
  play: async ({ canvasElement }) => {
    const canvas = await editNarrative(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar rascunho' }))
    await expect(await canvas.findByRole('button', { name: 'Salvando…' })).toBeDisabled()
  },
}

export const Conflict: Story = {
  beforeEach({ msw }) {
    msw.use(editReportConflict)
  },
  play: async ({ canvasElement }) => {
    const canvas = await editNarrative(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar rascunho' }))
    await expect(await canvas.findByText('Este relatório foi alterado em outra aba.')).toBeInTheDocument()
  },
}

export const SaveError: Story = {
  beforeEach({ msw }) {
    msw.use(editReportUnknownError)
  },
  play: async ({ canvasElement }) => {
    const canvas = await editNarrative(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Salvar rascunho' }))
    await expect(await canvas.findByText('Não foi possível concluir agora.')).toBeInTheDocument()
  },
}

export const ChecklistComplete: Story = {
  beforeEach({ msw }) {
    msw.use(reportCompleteDraft)
  },
}

export const FinalizeDialog: Story = {
  beforeEach({ msw }) {
    msw.use(reportCompleteDraft)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Finalizar relatório' }))
    await expect(await within(document.body).findByRole('dialog', { name: 'Finalizar relatório?' })).toBeInTheDocument()
  },
}

export const MinimumContentRefused: Story = {
  beforeEach({ msw }) {
    msw.use(reportCompleteDraft, finalizeReportMinimumContent)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Finalizar relatório' }))
    const dialog = await within(document.body).findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Finalizar relatório' }))
    await expect(
      await canvas.findByText('Inclua ao menos 2 pontos positivos e 2 negativos (20 caracteres no total).'),
    ).toBeInTheDocument()
  },
}

export const CurrentReading: Story = { args: { playerId: 1002, reportId: REPORT_IDS.current1002 } }

export const CurrentReadingOnPhone: Story = { ...CurrentReading, globals: PHONE }

export const ReplacedReading: Story = { args: { reportId: REPORT_IDS.original } }

export const CurrentWithPendingCorrection: Story = { args: { reportId: REPORT_IDS.correction } }

export const NewCorrection: Story = {
  args: { playerId: 1002, reportId: undefined, correctionOf: REPORT_IDS.current1002 },
}

export const NotFound: Story = {
  args: { reportId: REPORT_IDS.missing },
  beforeEach({ msw }) {
    msw.use(reportNotFound)
  },
}

export const Pending: Story = {
  beforeEach({ msw }) {
    msw.use(reportPending)
  },
}

export const LeaveWithoutSaving: Story = {
  render: () => <LeaveDialog open onLeave={fn()} onStay={fn()} />,
}
