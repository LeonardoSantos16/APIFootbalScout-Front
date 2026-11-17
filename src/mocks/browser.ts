import { setupWorker } from 'msw/browser'
import { readSession, saveSession } from '../api/session'
import { resetAuthStore, seedSession } from './authStore'
import { handlers } from './handlers'

const DEV_ACCESS_TOKEN_USES = 20

resetAuthStore({ accessTokenUses: DEV_ACCESS_TOKEN_USES })
if (!readSession()) saveSession(seedSession())

export const worker = setupWorker(...handlers)
