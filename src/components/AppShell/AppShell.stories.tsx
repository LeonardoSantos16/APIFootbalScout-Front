import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Card } from '../Card/Card'
import { ClubBand } from '../ClubBand/ClubBand'
import { PageColumns } from '../PageColumns/PageColumns'
import { SearchField } from '../SearchField/SearchField'
import { AppShell } from './AppShell'
import type { MenuLinkRenderer, MenuTarget } from './PhoneMenu'

const MENU_HREF: Record<MenuTarget, string> = { home: '#inicio', shortlists: '#shortlists', account: '#conta' }

const menuLink =
  (current?: MenuTarget): MenuLinkRenderer =>
  (target, { className, onClick, children }) => (
    <a href={MENU_HREF[target]} className={className} onClick={onClick} aria-current={target === current ? 'page' : undefined}>
      {children}
    </a>
  )

const meta = {
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: {
    homeLink: <a href="#inicio">APIFootballScout</a>,
    accountLink: <a href="#conta">Ana Ribeiro</a>,
    accountName: 'Ana Ribeiro',
    shortlistsLink: <a href="#shortlists">Shortlists</a>,
    renderMenuLink: menuLink(),
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

export const AccountCurrent: Story = {
  args: {
    accountLink: (
      <a href="#conta" aria-current="page">
        Ana Ribeiro
      </a>
    ),
  },
}

export const ShortlistsCurrent: Story = {
  args: {
    shortlistsLink: (
      <a href="#shortlists" aria-current="page">
        Shortlists
      </a>
    ),
  },
}

export const PhoneMenuOpen: Story = {
  args: { renderMenuLink: menuLink('home') },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Menu' }))
    await expect(within(document.body).getByRole('dialog', { name: 'Menu' })).toBeVisible()
  },
}
