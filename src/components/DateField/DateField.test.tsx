import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DateField } from './DateField'

describe('DateField', () => {
  it('edita a data com o limite de hoje', () => {
    // Arrange
    const onChange = vi.fn()
    render(<DateField label="Data da observação" value="2026-11-24" max="2026-11-24" onChange={onChange} />)

    // Act
    fireEvent.change(screen.getByLabelText('Data da observação'), { target: { value: '2026-11-20' } })

    // Assert
    expect(screen.getByLabelText('Data da observação')).toHaveAttribute('max', '2026-11-24')
    expect(onChange).toHaveBeenCalledWith('2026-11-20')
  })

  it('mostra a data como texto quando e somente leitura', () => {
    // Act
    render(
      <DateField
        label="Data da observação"
        value="2026-11-24"
        readOnly
        hint="A data da observação não muda depois de salvar."
      />,
    )

    // Assert
    expect(screen.getByText('24/11/2026')).toBeInTheDocument()
    expect(screen.getByText('A data da observação não muda depois de salvar.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
