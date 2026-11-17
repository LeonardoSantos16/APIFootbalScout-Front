import type { DetalhesDoJogador } from '../interfaces/jogador'

const POSICAO_POR_LETRA: Record<string, string> = {
  G: 'Goleiro',
  D: 'Defesa',
  M: 'Meio-campo',
  F: 'Ataque',
}

export const posicaoPelaLetra = (letra?: string | null): string | undefined =>
  letra ? POSICAO_POR_LETRA[letra] : undefined

export const idade = (dataDeNascimento: string, hoje: Date): number => {
  const nascimento = new Date(dataDeNascimento)
  const anos = hoje.getUTCFullYear() - nascimento.getUTCFullYear()
  const fezAniversario =
    hoje.getUTCMonth() > nascimento.getUTCMonth() ||
    (hoje.getUTCMonth() === nascimento.getUTCMonth() && hoje.getUTCDate() >= nascimento.getUTCDate())
  return fezAniversario ? anos : anos - 1
}

export const linhaDeApoio = (detalhes: DetalhesDoJogador, hoje: Date): string =>
  [
    posicaoPelaLetra(detalhes.position),
    detalhes.dateOfBirth ? `${idade(detalhes.dateOfBirth, hoje)} anos` : undefined,
    detalhes.team?.name,
  ]
    .filter(Boolean)
    .join(', ')
