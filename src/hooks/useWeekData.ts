import { useContext } from 'react'
import { WeekDataContext, type WeekData } from '../state/weekDataContextValue'

export function useWeekData(): WeekData {
  const data = useContext(WeekDataContext)
  if (!data) throw new Error('useWeekData must be used inside <WeekDataProvider>')
  return data
}
