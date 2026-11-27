import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetAuthStore } from '../mocks/authStore'
import { server } from '../mocks/server'
import { resetReportStore } from '../mocks/reportStore'
import { resetTrackingStore } from '../mocks/trackingStore'

configure({ asyncUtilTimeout: 3000 })

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetAuthStore()
  resetTrackingStore()
  resetReportStore()
  localStorage.clear()
})
afterAll(() => server.close())
