const SEEDED_PLAYERS = [1001, 1002, 1003]

const state = {
  tracked: new Set<number>(SEEDED_PLAYERS),
}

export const resetTrackingStore = () => {
  state.tracked = new Set(SEEDED_PLAYERS)
}

export const isTracked = (playerId: number) => state.tracked.has(playerId)

export const startTracking = (playerId: number) => {
  state.tracked.add(playerId)
}
