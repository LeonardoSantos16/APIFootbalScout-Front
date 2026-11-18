import type { Meta, StoryObj } from '@storybook/react-vite'
import { searchEmpty, searchPending, searchResults, searchSourceDown } from '../../../../mocks/handlers/search'
import { CandidateSearch } from './CandidateSearch'

const meta = {
  component: CandidateSearch,
  args: {
    pagePlayerId: 1001,
    pagePlayerName: 'Rafael Montes',
    pagePlayerLetter: 'M',
    onPick: () => {},
    renderResultLink: (_player, { onClick, ...props }) => <a href="#comparacao" onClick={onClick} {...props} />,
  },
} satisfies Meta<typeof CandidateSearch>

export default meta

type Story = StoryObj<typeof meta>

export const NoTerm: Story = {}

export const Results: Story = {
  args: { initialTerm: 'atlético' },
  beforeEach({ msw }) {
    msw.use(searchResults)
  },
}

export const NoComparable: Story = {
  args: { initialTerm: 'pedro' },
  beforeEach({ msw }) {
    msw.use(searchResults)
  },
}

export const Empty: Story = {
  args: { initialTerm: 'xyzabc' },
  beforeEach({ msw }) {
    msw.use(searchEmpty)
  },
}

export const Pending: Story = {
  args: { initialTerm: 'atlético' },
  beforeEach({ msw }) {
    msw.use(searchPending)
  },
}

export const SourceDown: Story = {
  args: { initialTerm: 'atlético' },
  beforeEach({ msw }) {
    msw.use(searchSourceDown)
  },
}
