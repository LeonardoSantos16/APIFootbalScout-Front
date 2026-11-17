import { describe, expect, it } from 'vitest'
import { fetchClient } from '../api/client'

describe('server', () => {
  it('recusa uma chamada sem handler', async () => {
    // Act
    const call = fetchClient.GET('/api/Players/{id}/profile', { params: { path: { id: 1 } } })

    // Assert
    await expect(call).rejects.toThrow(/onUnhandledRequest/)
  })
})
