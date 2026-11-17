import type { Preview } from '@storybook/react-vite'
import { QueryClientProvider } from '@tanstack/react-query'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { createQueryClient } from '../src/api/queryClient'
import '../src/styles/global.css'

const preview: Preview = {
  loaders: [mswLoader()],
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient({ retryDelay: 0 })}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    backgrounds: { disable: true },
  },
}

export default preview
