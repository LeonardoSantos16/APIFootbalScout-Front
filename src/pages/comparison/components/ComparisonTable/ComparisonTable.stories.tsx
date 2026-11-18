import type { Meta, StoryObj } from '@storybook/react-vite'
import { realizedComparison } from '../../../../mocks/fixtures/comparison'
import { buildComparison } from '../../utils/comparison'
import { ComparisonTable } from './ComparisonTable'

const meta = { component: ComparisonTable } satisfies Meta<typeof ComparisonTable>

export default meta

type Story = StoryObj<typeof meta>

const realized = buildComparison(realizedComparison(1001, 1006), { pageId: 1001, otherId: 1006 })
const oneSideRefused = buildComparison(realizedComparison(1001, 1005), { pageId: 1001, otherId: 1005 })

export const Realized: Story = {
  args: { columns: realized.columns, rows: realized.rows, footer: <span>Rodapé</span> },
}

export const OneSideRefused: Story = {
  args: { columns: oneSideRefused.columns, rows: oneSideRefused.rows },
}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { columns: realized.columns, rows: realized.rows },
}

export const Loading: Story = { args: {} }
