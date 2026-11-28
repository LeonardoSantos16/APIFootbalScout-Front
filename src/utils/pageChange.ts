const PLAYER_TAB = /^(\/jogadores\/[^/]+)(\/(metricas|comparacao|acompanhamento|relatorios))?\/?$/

const pathnameOf = (href: string): string => href.split(/[?#]/)[0]

const playerOf = (pathname: string): string | undefined => PLAYER_TAB.exec(pathname)?.[1]

export const shouldMoveFocus = (previous: string | undefined, next: string): boolean => {
  if (previous === undefined) return false
  const from = pathnameOf(previous)
  const to = pathnameOf(next)
  if (from === to) return false
  const player = playerOf(from)
  return player === undefined || player !== playerOf(to)
}

export const scrollKey = (pathname: string): string => playerOf(pathnameOf(pathname)) ?? pathnameOf(pathname)
