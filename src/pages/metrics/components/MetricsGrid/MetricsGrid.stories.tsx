import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildRows, footerSample, footerText } from '../../utils/metrics'
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
    footnote: footerText(footerSample(calculatedAttributes)),
  },
}

export const AllRefused: Story = {
  args: {
    rows: buildRows(metricsResponse(insufficientSampleAttributes)),
    footnote: footerText(footerSample(insufficientSampleAttributes)),
  },
}

export const Loading: Story = { args: { footnote: footerText() } }
