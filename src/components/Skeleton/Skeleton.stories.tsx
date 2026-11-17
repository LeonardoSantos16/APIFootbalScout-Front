import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'
import styles from './Skeleton.stories.module.css'

const meta = { component: Skeleton } satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Value: Story = { args: { className: styles.value } }

export const Line: Story = { args: { className: styles.line } }
