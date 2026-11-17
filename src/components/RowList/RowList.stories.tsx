import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { RowList, type Row } from './RowList'

const cells = (games: number, minutes: string, goals: number, assists: number, rating: string) => [
  { value: games, label: 'jogos' },
  { value: minutes, label: 'min' },
  { value: goals, label: 'gols' },
  { value: assists, label: 'assist.' },
  { value: rating, label: 'nota', labelBefore: true },
]

const results: Row[] = [
  { id: '1', title: 'Rafael Silva', detail: 'Meio-campo, Atlético Serrano, Brasil' },
  { id: '2', title: 'Thiago Silva', detail: 'Defesa, Fluminense, Brasil' },
  { id: '3', title: 'João Silva', detail: 'Goleiro' },
]

const slices: Row[] = [
  { id: 'a', title: 'Clube · Brasileirão Série A · 2025', cells: cells(24, '1.920', 4, 3, '7,12') },
  { id: 'b', title: 'Clube · Copa do Brasil · 2025', cells: cells(6, '480', 1, 0, '6,94') },
  { id: 'c', title: 'Seleção · Eliminatórias Sul-Americanas · 2024', cells: cells(4, '312', 0, 1, '6,88') },
]

const transfers: Row[] = [
  { id: 't1', title: 'Serra Azul → Atlético Serrano', detail: 'jan. 2024 · €3,2M' },
  { id: 't2', title: 'Atlético Serrano → Serra Azul', detail: 'jul. 2022 · Empréstimo' },
]

const meta = {
  component: RowList,
  args: {
    ariaLabel: 'Resultados',
    rows: results,
    renderLink: (row, props) => <a href={`#${row.id}`} {...props} />,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Card>
          <Story />
        </Card>
      </div>
    ),
  ],
} satisfies Meta<typeof RowList>

export default meta

type Story = StoryObj<typeof meta>

export const Results: Story = {}

export const Slices: Story = {
  args: {
    ariaLabel: 'Recortes',
    rows: slices,
    titleLabel: 'Recorte',
    columns: ['Jogos', 'Minutos', 'Gols', 'Assist.', 'Nota'],
    footer: <Button>Mostrar todos os recortes (14)</Button>,
  },
}

export const SlicesOnPhone: Story = {
  ...Slices,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

export const Transfers: Story = { args: { ariaLabel: 'Transferências', rows: transfers, renderLink: undefined } }
