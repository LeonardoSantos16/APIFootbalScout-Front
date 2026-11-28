import type { Meta, StoryObj } from '@storybook/react-vite'
import { AuthShell } from '../../components/AuthShell/AuthShell'
import { linkButtonClassName } from '../../components/Button/buttonClassName'
import { StoryShell } from '../../test/StoryShell'
import { NotFoundPage } from './NotFoundPage'

const meta = {
  component: NotFoundPage,
  parameters: { layout: 'fullscreen' },
  args: { action: null },
} satisfies Meta<typeof NotFoundPage>

export default meta

type Story = StoryObj<typeof meta>

export const SignedIn: Story = {
  args: {
    framed: true,
    action: (
      <a href="#inicio" className={linkButtonClassName('secondary')}>
        Ir para o início
      </a>
    ),
  },
  render: (args) => (
    <StoryShell>
      <NotFoundPage {...args} />
    </StoryShell>
  ),
}

export const SignedOut: Story = {
  parameters: { session: 'signed-out' },
  args: {
    action: (
      <a href="#entrar" className={linkButtonClassName('primary')}>
        Entrar
      </a>
    ),
  },
  render: (args) => (
    <AuthShell>
      <NotFoundPage {...args} />
    </AuthShell>
  ),
}

export const SignedInPhone: Story = {
  ...SignedIn,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
