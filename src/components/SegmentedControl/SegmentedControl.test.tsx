import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const OPTIONS = [
  { value: 'Contratar', label: 'Contratar' },
  { value: 'Monitorar', label: 'Monitorar' },
]

describe('SegmentedControl', () => {
  it('agrupa as opcoes sob o rotulo e marca a escolhida', () => {
    // Act
    render(<SegmentedControl label="Parecer" options={OPTIONS} value="Monitorar" />)

    // Assert
    expect(screen.getByRole('group', { name: 'Parecer' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Monitorar' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Contratar' })).not.toBeChecked()
  })

  it('avisa a opcao escolhida', () => {
    // Arrange
    const onChange = vi.fn()
    render(<SegmentedControl label="Parecer" options={OPTIONS} value={null} onChange={onChange} />)

    // Act
    fireEvent.click(screen.getByRole('radio', { name: 'Contratar' }))

    // Assert
    expect(onChange).toHaveBeenCalledWith('Contratar')
  })
})
