import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  searchEmpty,
  searchOnlyTeams,
  searchPending,
  searchResults,
  searchSourceDown,
} from '../../mocks/handlers/search'
import { StoryShell } from '../../test/StoryShell'
import { SearchPage } from './SearchPage'

interface ScreenProps {
  initialTerm?: string
}

const Screen = ({ initialTerm }: ScreenProps) => {
  const [term, setTerm] = useState(initialTerm)
  return (
    <StoryShell withSearch={false}>
      <SearchPage
        key={term ?? ''}
        term={term}
        onSearch={setTerm}
        renderPlayerLink={(player, props) => <a href={`#jogador-${player.id}`} {...props} />}
      />
    </StoryShell>
  )
}

const meta = {
  title: 'Pages/SearchPage',
  component: Screen,
  parameters: { layout: 'fullscreen' },
  args: { initialTerm: 'ra' },
} satisfies Meta<typeof Screen>

export default meta

type Story = StoryObj<typeof meta>

export const WithoutTerm: Story = {
  args: { initialTerm: undefined },
  beforeEach({ msw }) {
    msw.use(searchResults)
  },
}

export const Results: Story = {
  beforeEach({ msw }) {
    msw.use(searchResults)
  },
}

export const ResultsOnPhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  beforeEach({ msw }) {
    msw.use(searchResults)
  },
}

export const ShortTermInUrl: Story = {
  args: { initialTerm: 's' },
  beforeEach({ msw }) {
    msw.use(searchResults)
  },
}

export const Loading: Story = {
  args: { initialTerm: 'rafael' },
  beforeEach({ msw }) {
    msw.use(searchPending)
  },
}

export const Empty: Story = {
  args: { initialTerm: 'xyzabc' },
  beforeEach({ msw }) {
    msw.use(searchEmpty)
  },
}

export const OnlyTeams: Story = {
  args: { initialTerm: 'serrano' },
  beforeEach({ msw }) {
    msw.use(searchOnlyTeams)
  },
}

export const SourceDown: Story = {
  args: { initialTerm: 'rafael' },
  beforeEach({ msw }) {
    msw.use(searchSourceDown)
  },
}
