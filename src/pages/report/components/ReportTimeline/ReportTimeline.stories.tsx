import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from '../../../../components/Card/Card'
import { seededReports } from '../../../../mocks/fixtures/reports'
import { buildTimeline } from '../../utils/timeline'
import { ReportTimeline } from './ReportTimeline'
import { ReportTimelineSkeleton } from './ReportTimelineSkeleton'

const groups1001 = buildTimeline(seededReports().filter((report) => report.jogadorId === 1001))

const meta = {
  component: ReportTimeline,
  args: {
    groups: groups1001,
    renderLink: (_item, props) => <a href="#" {...props} />,
  },
  decorators: [
    (Story) => (
      <Card title="Relatórios">
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof ReportTimeline>

export default meta

type Story = StoryObj<typeof meta>

export const Chain: Story = {}

export const Single: Story = {
  args: { groups: buildTimeline(seededReports().filter((report) => report.jogadorId === 1002)) },
}

export const Loading: Story = { render: () => <ReportTimelineSkeleton /> }
