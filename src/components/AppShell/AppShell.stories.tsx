import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Card } from '../Card/Card'
import { ClubBand } from '../ClubBand/ClubBand'
import { PageColumns } from '../PageColumns/PageColumns'
import { SearchField } from '../SearchField/SearchField'
import { AppShell } from './AppShell'

const meta = {
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: {
    accountLink: <a href="#conta">Ana Ribeiro</a>,
    onSignOut: fn(),
    search: (
      <SearchField
        label="Buscar jogador"
        placeholder="Buscar jogador"
        size="compact"
        value=""
        onChange={fn()}
        onSubmit={fn()}
      />
    ),
    searchLink: <a href="#busca">Buscar</a>,
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

export const OnSearchPage: Story = { args: { search: undefined, searchLink: undefined } }

export const Loading: Story = { args: { loading: true, children: null } }

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
