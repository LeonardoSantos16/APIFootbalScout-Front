import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const options = [
  { value: 'a', label: 'Brasileirão Série A · 2025' },
  { value: 'b', label: 'Brasileirão Série A · 2024' },
]

describe('Select', () => {
  it('e anunciado pelo rotulo', () => {
    // Arrange
    render(<Select label="Competição e temporada" options={options} value="a" />)

    // Act
    const select = screen.getByRole('combobox', { name: 'Competição e temporada' })

    // Assert
    expect(select).toHaveValue('a')
  })

  it('avisa a opcao escolhida', async () => {
    // Arrange
    const onChange = vi.fn()
    render(<Select label="Competição e temporada" options={options} value="a" onChange={onChange} />)

    // Act
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Brasileirão Série A · 2024')

    // Assert
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('mostra o rotulo e nenhum seletor enquanto carrega', () => {
    // Arrange
    render(<Select label="Competição e temporada" options={[]} loading />)

    // Act
    const select = screen.queryByRole('combobox')

    // Assert
    expect(select).not.toBeInTheDocument()
    expect(screen.getByText('Competição e temporada')).toBeInTheDocument()
  })
})
