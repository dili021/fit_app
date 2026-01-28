import { useDashboardQueries } from './api/useDashboardQueries'
import { useDashboardMutations } from './api/useDashboardMutations'
import { useMesocycleStatusCheck } from './useMesocycleStatusCheck'

export function useDashboardData(userId: string) {
  const queries = useDashboardQueries(userId)
  const mutations = useDashboardMutations()

  const { showCompletionPrompt, setShowCompletionPrompt } =
    useMesocycleStatusCheck({
      mesocycleId: queries.activeMesocycle?._id ?? null,
      checkStatus: mutations.checkStatus,
    })

  return {
    ...queries,
    ...mutations,
    showCompletionPrompt,
    setShowCompletionPrompt,
  }
}
