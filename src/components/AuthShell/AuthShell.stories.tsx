import type { Meta, StoryObj } from '@storybook/react-vite'
import { Notice } from '../Notice/Notice'
import { AuthShell } from './AuthShell'

const meta = {
  component: AuthShell,
  parameters: { layout: 'fullscreen' },
  args: { children: <Notice>Sua sessão expirou. Entre novamente.</Notice> },
} satisfies Meta<typeof AuthShell>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
