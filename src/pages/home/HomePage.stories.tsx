import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { AppShell } from '../../components/AppShell/AppShell'
import { HomePage } from './HomePage'

const meta = {
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  args: { name: 'Ana Ribeiro', onSearch: fn() },
  decorators: [
    (Story) => (
      <AppShell accountLink={<a href="#conta">Ana Ribeiro</a>}>
        <Story />
      </AppShell>
    ),
  ],
} satisfies Meta<typeof HomePage>

export default meta

type Story = StoryObj<typeof meta>

export const Greeting: Story = {}

export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
