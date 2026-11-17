import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { signOut, type SignOutScope } from '../api/signOut'
import type { SessionNotice } from '../interfaces/session'

export const useLeaveSession = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const leave = (notice?: SessionNotice) => {
    queryClient.clear()
    void navigate({ to: '/entrar', search: { aviso: notice } })
  }

  return {
    leave,
    signOut: (scope: SignOutScope) => {
      signOut(scope)
      leave()
    },
  }
}
