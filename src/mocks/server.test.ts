import { describe, expect, it } from 'vitest'
import { fetchClient } from '../api/client'

describe('server', () => {
  it('recusa uma chamada sem handler', async () => {
    // Act
    const call = fetchClient.GET('/api/Auth/me')

    // Assert
    await expect(call).rejects.toThrow(/onUnhandledRequest/)
  })
})
