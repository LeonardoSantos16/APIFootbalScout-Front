import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { createQueryClient } from './queryClient'

const countCalls = (responses: Array<ApiError | string>) => {
  let calls = 0
  const queryFn = async () => {
    const response = responses[Math.min(calls, responses.length - 1)]
    calls += 1
    if (response instanceof ApiError) throw response
    return response
  }
  return { queryFn, calls: () => calls }
}

describe('createQueryClient', () => {
  it('repete uma vez uma chamada que respondeu 502', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    const source = countCalls([new ApiError(502, undefined), 'ok'])

    // Act
    const result = await client.fetchQuery({ queryKey: ['502-ok'], queryFn: source.queryFn })

    // Assert
    expect(result).toBe('ok')
    expect(source.calls()).toBe(2)
  })

  it('desiste depois de repetir o 502 uma vez', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    const source = countCalls([new ApiError(502, undefined)])

    // Act
    const call = client.fetchQuery({ queryKey: ['502-502'], queryFn: source.queryFn })

    // Assert
    await expect(call).rejects.toBeInstanceOf(ApiError)
    expect(source.calls()).toBe(2)
  })

  it('nao repete um 404', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    const source = countCalls([new ApiError(404, undefined), 'ok'])

    // Act
    const call = client.fetchQuery({ queryKey: ['404'], queryFn: source.queryFn })

    // Assert
    await expect(call).rejects.toBeInstanceOf(ApiError)
    expect(source.calls()).toBe(1)
  })

  it('nao repete um erro que nao veio da API', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    let calls = 0
    const queryFn = async () => {
      calls += 1
      throw new TypeError('Failed to fetch')
    }

    // Act
    const call = client.fetchQuery({ queryKey: ['rede'], queryFn })

    // Assert
    await expect(call).rejects.toBeInstanceOf(TypeError)
    expect(calls).toBe(1)
  })

  it('espera 2000 ms antes de repetir', () => {
    // Arrange
    const client = createQueryClient()

    // Act
    const retryDelay = client.getDefaultOptions().queries?.retryDelay

    // Assert
    expect(retryDelay).toBe(2000)
  })
})
