import type { Preview } from '@storybook/react-vite'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
}

export default preview
