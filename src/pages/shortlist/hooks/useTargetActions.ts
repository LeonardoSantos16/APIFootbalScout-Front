import { useState } from 'react'
import type { TargetWrite } from '../interfaces/shortlist'
import { writeErrorText } from '../utils/shortlistError'
import { useTargetWrite } from './useTargetWrite'

export const useTargetActions = (shortlistId: string) => {
  const write = useTargetWrite(shortlistId)
  const [notice, setNotice] = useState<string>()

  const send = (target: TargetWrite) =>
    write.mutate(target, {
      onSuccess: () => setNotice(undefined),
      onError: (error) => setNotice(writeErrorText(error, 'page')),
    })

  return {
    send,
    notice,
    locked: write.isPending,
    pending: write.isPending ? write.variables : undefined,
  }
}
