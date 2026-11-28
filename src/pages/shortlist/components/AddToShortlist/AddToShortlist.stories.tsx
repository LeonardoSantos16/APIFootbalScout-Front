import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { handlers } from '../../../../mocks/handlers'
import {
  addTargetCurrency,
  addTargetDuplicate,
  shortlistsEmpty,
  shortlistsPending,
  writePending,
} from '../../../../mocks/handlers/shortlists'
import { PlayerStoryShell } from '../../../../test/StoryShell'
import { AddToShortlist } from './AddToShortlist'

const OPEN = 'Adicionar à shortlist'

interface ScreenProps {
  playerId: number
}

const Screen = ({ playerId }: ScreenProps) => (
  <PlayerStoryShell
    playerId={playerId}
    tab="profile"
    bandAction={
      <AddToShortlist
        playerId={playerId}
        renderShortlistLink={(shortlistId, props) => <a href={`#${shortlistId}`} {...props} />}
      />
    }
  />
)

const meta = {
  title: 'Pages/AddToShortlist',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { playerId: 1001 },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

const PHONE = { viewport: { value: 'mobile1', isRotated: false } }

const openDialog = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement)
  await userEvent.click(await canvas.findByRole('button', { name: OPEN }))
  const body = within(canvasElement.ownerDocument.body)
  return within(await body.findByRole('dialog', { name: OPEN }))
}

const chooseEmpty = async (dialog: ReturnType<typeof within>) => {
  const select = await dialog.findByRole('combobox', { name: 'Shortlist' })
  const option = within(select).getByRole('option', { name: /^Meias para janeiro — / })
  await userEvent.selectOptions(select, option)
}

export const Band: Story = {
  beforeEach({ msw }) {
    msw.use(...handlers)
  },
}

export const BandOnPhone: Story = { ...Band, globals: PHONE }

export const Choosing: Story = {
  ...Band,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await expect(await dialog.findByText('A moeda da lista é EUR.')).toBeInTheDocument()
  },
}

export const ChoosingOnPhone: Story = { ...Choosing, globals: PHONE }

export const FreeCurrency: Story = {
  ...Band,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await chooseEmpty(dialog)
    await expect(dialog.getByText('O primeiro alvo define a moeda da lista.')).toBeInTheDocument()
  },
}

export const CostError: Story = {
  ...Band,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    const field = await dialog.findByRole('textbox', { name: 'Custo estimado' })
    await userEvent.clear(field)
    await userEvent.type(field, '0')
    await userEvent.click(dialog.getByRole('button', { name: 'Adicionar' }))
    await expect(dialog.getByText('Informe um custo maior que zero.')).toBeInTheDocument()
  },
}

export const Adding: Story = {
  beforeEach({ msw }) {
    msw.use(...writePending, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await chooseEmpty(dialog)
    await userEvent.click(dialog.getByRole('button', { name: 'Adicionar' }))
    await expect(await dialog.findByRole('button', { name: 'Adicionando…' })).toBeDisabled()
  },
}

export const Added: Story = {
  ...Band,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await chooseEmpty(dialog)
    await userEvent.click(dialog.getByRole('button', { name: 'Adicionar' }))
    await expect(await dialog.findByText('Adicionado a Meias para janeiro, na prioridade 1.')).toBeInTheDocument()
  },
}

export const AlreadyInShortlist: Story = {
  beforeEach({ msw }) {
    msw.use(addTargetDuplicate, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await chooseEmpty(dialog)
    await userEvent.click(dialog.getByRole('button', { name: 'Adicionar' }))
    await expect(await dialog.findByText('Este jogador já está na shortlist.')).toBeInTheDocument()
  },
}

export const OtherCurrency: Story = {
  beforeEach({ msw }) {
    msw.use(addTargetCurrency, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await chooseEmpty(dialog)
    await userEvent.click(dialog.getByRole('button', { name: 'Adicionar' }))
    await expect(await dialog.findByText('Todos os custos da shortlist precisam usar a mesma moeda.')).toBeInTheDocument()
  },
}

export const Conflict: Story = {
  ...Band,
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await userEvent.click(await dialog.findByRole('button', { name: 'Adicionar' }))
    await expect(
      await dialog.findByText('Esta shortlist foi alterada em outra aba. Confira e tente de novo.'),
    ).toBeInTheDocument()
  },
}

export const NoShortlist: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsEmpty, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await expect(
      await dialog.findByText('Você ainda não tem shortlist. Crie uma para adicionar Rafael Montes.'),
    ).toBeInTheDocument()
  },
}

export const ShortlistsLoading: Story = {
  beforeEach({ msw }) {
    msw.use(shortlistsPending, ...handlers)
  },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await expect(await dialog.findByRole('status', { name: 'Carregando shortlists' })).toBeInTheDocument()
  },
}
