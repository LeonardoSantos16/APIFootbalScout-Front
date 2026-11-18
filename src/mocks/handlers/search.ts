import { delay } from 'msw'
import { competitionResult, searchPlayers, teamResult } from '../fixtures/search'
import { http } from '../http'
import { plainText } from '../responses'

const SEARCH = '/api/Players/search'

export const searchResults = http.get(SEARCH, ({ query, response }) =>
  response(200).json(searchPlayers(query.get('q') ?? '')),
)

export const searchEmpty = http.get(SEARCH, ({ response }) => response(200).json({ results: [] }))

export const searchOnlyTeams = http.get(SEARCH, ({ response }) =>
  response(200).json({ results: [teamResult(), teamResult('Atlético Serrano Sub-20'), competitionResult()] }),
)

export const searchSourceDown = http.get(SEARCH, ({ response }) =>
  response.untyped(plainText(502, 'Bad Gateway')),
)

export const searchBlankTerm = http.get(SEARCH, ({ response }) =>
  response.untyped(plainText(400, 'Name is required')),
)

export const searchPending = http.get(SEARCH, async ({ response }) => {
  await delay('infinite')
  return response(200).json({ results: [] })
})
