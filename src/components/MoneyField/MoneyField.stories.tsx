import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MoneyField } from './MoneyField'

const CURRENCIES = ['EUR', 'BRL', 'USD', 'GBP']

const meta = {
  component: MoneyField,
  args: { value: '12,5', currency: 'EUR', currencies: CURRENCIES },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoneyField>

export default meta

type Story = StoryObj<typeof meta>

export const FreeCurrency: Story = {
  args: { hint: 'O primeiro alvo define a moeda da lista.' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    const [currency, setCurrency] = useState(args.currency)
    return <MoneyField {...args} value={value} onChange={setValue} currency={currency} onCurrencyChange={setCurrency} />
  },
}

export const LockedCurrency: Story = { args: { value: '8', lockedCurrency: true, hint: 'A moeda da lista é EUR.' } }

export const WithError: Story = { args: { value: '0', lockedCurrency: true, error: 'Informe um custo maior que zero.' } }

export const Disabled: Story = { args: { lockedCurrency: true, disabled: true } }
