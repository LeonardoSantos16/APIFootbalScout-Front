import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SegmentedControl, type SegmentedOption } from './SegmentedControl'

const OPTIONS: SegmentedOption<string>[] = [
  { value: 'Contratar', label: 'Contratar' },
  { value: 'Monitorar', label: 'Monitorar' },
  { value: 'Reavaliar', label: 'Reavaliar' },
  { value: 'Descartar', label: 'Descartar' },
]

const Interactive = ({ initial, disabled }: { initial: string | null; disabled?: boolean }) => {
  const [value, setValue] = useState(initial)
  return <SegmentedControl label="Parecer" options={OPTIONS} value={value} onChange={setValue} disabled={disabled} />
}

const meta = {
  component: Interactive,
  args: { initial: 'Monitorar' },
} satisfies Meta<typeof Interactive>

export default meta

type Story = StoryObj<typeof meta>

export const Chosen: Story = {}

export const NoneChosen: Story = { args: { initial: null } }

export const Disabled: Story = { args: { disabled: true } }
