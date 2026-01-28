import { useEffect, useState } from 'react'
import type { Id } from '@db/_generated/dataModel'

interface UseMesocycleStatusCheckOptions {
  mesocycleId: Id<'mesocycles'> | null | undefined
  checkStatus: (args: { mesocycleId: Id<'mesocycles'> }) => Promise<{
    status: string
    action: string | null
  }>
}

export function useMesocycleStatusCheck({
  mesocycleId,
  checkStatus,
}: UseMesocycleStatusCheckOptions) {
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false)

  useEffect(() => {
    if (mesocycleId) {
      void checkStatus({ mesocycleId })
        .then((result) => {
          if (result.status === 'completed' && result.action === 'completed') {
            setShowCompletionPrompt(true)
          }
        })
        .catch(() => {
          // Silently handle errors - status check is not critical
        })
    }
  }, [mesocycleId, checkStatus])

  return { showCompletionPrompt, setShowCompletionPrompt }
}
