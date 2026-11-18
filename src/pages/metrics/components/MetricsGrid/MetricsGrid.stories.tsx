import type { Meta, StoryObj } from '@storybook/react-vite'
import { commonSample } from '../../../../utils/attributes'
import { buildRows, footerText } from '../../utils/metrics'
import { MetricsGrid } from './MetricsGrid'
import {
  calculatedAttributes,
  insufficientSampleAttributes,
  metricsResponse,
} from '../../../../mocks/fixtures/metrics'

const meta = { component: MetricsGrid } satisfies Meta<typeof MetricsGrid>

export default meta

type Story = StoryObj<typeof meta>

export const Calculated: Story = {
  args: {
    rows: buildRows(metricsResponse(calculatedAttributes)),
    footnote: footerText(commonSample(calculatedAttributes)),
  },
}

export const AllRefused: Story = {
  args: {
    rows: buildRows(metricsResponse(insufficientSampleAttributes)),
    footnote: footerText(commonSample(insufficientSampleAttributes)),
  },
}

export const Loading: Story = { args: { footnote: footerText() } }
