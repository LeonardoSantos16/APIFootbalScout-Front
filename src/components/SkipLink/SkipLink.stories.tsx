import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { MAIN_CONTENT_ID } from './mainContent'
import { SkipLink } from './SkipLink'

const meta = {
  component: SkipLink,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 160 }}>
        <Story />
        <main id={MAIN_CONTENT_ID} tabIndex={-1} />
      </div>
    ),
  ],
} satisfies Meta<typeof SkipLink>

export default meta

type Story = StoryObj<typeof meta>

export const Hidden: Story = {}

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(within(canvasElement).getByRole('link', { name: 'Pular para o conteúdo' })).toHaveFocus()
  },
}
