import type { Meta, StoryObj } from '@storybook/react-vite'
import { FinishChecklist } from './FinishChecklist'

const meta = {
  component: FinishChecklist,
  args: {
    items: [
      { label: 'Nota', done: true },
      { label: 'Parecer', done: true },
      { label: '2 pontos positivos', done: false, progress: '1 de 2' },
      { label: '2 pontos negativos', done: false, progress: '0 de 2' },
      { label: '20 caracteres nos pontos', done: true, progress: '30 de 20' },
    ],
  },
} satisfies Meta<typeof FinishChecklist>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const Complete: Story = {
  args: {
    items: [
      { label: 'Nota', done: true },
      { label: 'Parecer', done: true },
      { label: '2 pontos positivos', done: true, progress: '2 de 2' },
      { label: '2 pontos negativos', done: true, progress: '2 de 2' },
      { label: '20 caracteres nos pontos', done: true, progress: '64 de 20' },
    ],
  },
}

export const Empty: Story = {
  args: {
    items: [
      { label: 'Nota', done: false },
      { label: 'Parecer', done: false },
      { label: '2 pontos positivos', done: false, progress: '0 de 2' },
      { label: '2 pontos negativos', done: false, progress: '0 de 2' },
      { label: '20 caracteres nos pontos', done: false, progress: '0 de 20' },
    ],
  },
}
