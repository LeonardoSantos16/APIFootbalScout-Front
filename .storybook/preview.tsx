import type { Preview } from '@storybook/react-vite'
import { QueryClientProvider } from '@tanstack/react-query'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { createQueryClient } from '../src/api/queryClient'
import { clearSession, saveSession } from '../src/api/session'
import { resetAuthStore, seedSession } from '../src/mocks/authStore'
import { resetShortlistStore } from '../src/mocks/shortlistStore'
import '../src/styles/global.css'

const preview: Preview = {
  loaders: [
    ({ parameters }) => {
      resetAuthStore()
      resetShortlistStore()
      if (parameters.session === 'signed-out') clearSession()
      else saveSession(seedSession())
    },
    mswLoader(),
  ],
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
