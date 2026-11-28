export const parsePlayerId = (raw: string): number | null => Number(raw)

export const isUuid = (raw: string): boolean => raw.length > 0
