const PLAYER_ID = /^[1-9]\d*$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const parsePlayerId = (raw: string): number | null => (PLAYER_ID.test(raw) ? Number(raw) : null)

export const isUuid = (raw: string): boolean => UUID.test(raw)
