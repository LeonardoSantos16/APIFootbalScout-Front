import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  trackingMarketValueDownResponse,
  trackingNoRelevantChangeResponse,
  trackingOpenedTodayResponse,
  trackingUnavailableResponse,
  trackingWithChangesResponse,
} from '../../../../mocks/fixtures/tracking'
import type { TrackingResponse } from '../../interfaces/tracking'
import { buildMeasurements } from '../../utils/measurements'
import { windowText } from '../../utils/window'
import { TrackingPanel } from './TrackingPanel'

const viewOf = (response: TrackingResponse) => ({
  window: windowText(response.janela),
  measurements: buildMeasurements(response),
})

const meta = {
  component: TrackingPanel,
  args: { view: viewOf(trackingWithChangesResponse()) },
} satisfies Meta<typeof TrackingPanel>

export default meta

type Story = StoryObj<typeof meta>

export const WithChanges: Story = {}

export const MarketValueDown: Story = {
  args: { view: viewOf(trackingMarketValueDownResponse()) },
}

export const OpenedToday: Story = {
  args: { view: viewOf(trackingOpenedTodayResponse()) },
}

export const NoRelevantChange: Story = {
  args: { view: viewOf(trackingNoRelevantChangeResponse()) },
}

export const Unavailable: Story = {
  args: { view: viewOf(trackingUnavailableResponse()) },
}

export const Loading: Story = {
  args: { view: undefined },
}
