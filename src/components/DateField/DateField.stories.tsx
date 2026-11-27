import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateField } from './DateField'

const meta = {
  component: DateField,
  args: { label: 'Data da observação', value: '2026-11-24', max: '2026-11-24' },
} satisfies Meta<typeof DateField>

export default meta

type Story = StoryObj<typeof meta>

export const Editable: Story = {}

export const ReadOnly: Story = {
  args: { readOnly: true, hint: 'A data da observação não muda depois de salvar.' },
}

export const WithError: Story = { args: { error: 'A data da observação não pode estar no futuro.' } }
