import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { createQueryClient } from './queryClient'

const contarChamadas = (respostas: Array<ApiError | string>) => {
  let chamadas = 0
  const queryFn = async () => {
    const resposta = respostas[Math.min(chamadas, respostas.length - 1)]
    chamadas += 1
    if (resposta instanceof ApiError) throw resposta
    return resposta
  }
  return { queryFn, chamadas: () => chamadas }
}

describe('createQueryClient', () => {
  it('repete uma vez uma chamada que respondeu 502', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    const fonte = contarChamadas([new ApiError(502, undefined), 'ok'])

    // Act
    const resultado = await client.fetchQuery({ queryKey: ['502-ok'], queryFn: fonte.queryFn })

    // Assert
    expect(resultado).toBe('ok')
    expect(fonte.chamadas()).toBe(2)
  })

  it('desiste depois de repetir o 502 uma vez', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    const fonte = contarChamadas([new ApiError(502, undefined)])

    // Act
    const chamada = client.fetchQuery({ queryKey: ['502-502'], queryFn: fonte.queryFn })

    // Assert
    await expect(chamada).rejects.toBeInstanceOf(ApiError)
    expect(fonte.chamadas()).toBe(2)
  })

  it('nao repete um 404', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    const fonte = contarChamadas([new ApiError(404, undefined), 'ok'])

    // Act
    const chamada = client.fetchQuery({ queryKey: ['404'], queryFn: fonte.queryFn })

    // Assert
    await expect(chamada).rejects.toBeInstanceOf(ApiError)
    expect(fonte.chamadas()).toBe(1)
  })

  it('nao repete um erro que nao veio da API', async () => {
    // Arrange
    const client = createQueryClient({ retryDelay: 0 })
    let chamadas = 0
    const queryFn = async () => {
      chamadas += 1
      throw new TypeError('Failed to fetch')
    }

    // Act
    const chamada = client.fetchQuery({ queryKey: ['rede'], queryFn })

    // Assert
    await expect(chamada).rejects.toBeInstanceOf(TypeError)
    expect(chamadas).toBe(1)
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
