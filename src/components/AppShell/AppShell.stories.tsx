import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Card } from '../Card/Card'
import { ClubBand } from '../ClubBand/ClubBand'
import { PageColumns } from '../PageColumns/PageColumns'
import { AppShell } from './AppShell'

const meta = {
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: {
    accountLink: <a href="#conta">Ana Ribeiro</a>,
    onSignOut: fn(),
    children: (
      <PageColumns>
        <Card header={<ClubBand name="Rafael Montes" subtitle="Meio-campo, 27 anos, Atlético Serrano" />}>
          Conteúdo da página.
        </Card>
      </PageColumns>
    ),
  },
} satisfies Meta<typeof AppShell>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Loading: Story = { args: { loading: true, children: null } }

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
