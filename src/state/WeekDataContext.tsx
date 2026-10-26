import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { calcWeek, type WeekResult } from '../lib/calc'
import { loadState, saveState } from '../lib/storage'
import { WeekDataContext, type WeekData } from './weekDataContextValue'
import { initialWeekState, weekReducer, type WeekMode, type WeekState } from './weekState'

interface Props {
  children: ReactNode
  /** Starting state (tests). Without it, the last saved state is restored from localStorage. */
  initialState?: WeekState
}

export function WeekDataProvider({ children, initialState }: Props) {
  const [state, dispatch] = useReducer(
    weekReducer,
    initialState,
    (given) => given ?? loadState() ?? initialWeekState(),
  )

  // Save every change; this is the only place data is written.
  useEffect(() => {
    saveState(state)
  }, [state])

  const results = useMemo(() => calcResults(state), [state])
  const value = useMemo<WeekData>(() => ({ state, dispatch, results }), [state, results])

  return <WeekDataContext value={value}>{children}</WeekDataContext>
}

function calcResults(state: WeekState): Record<WeekMode, WeekResult> {
  return {
    current: calcWeek(state.weeks.current, { childcareSkipped: state.childcareSkipped.current }),
    ideal: calcWeek(state.weeks.ideal, { childcareSkipped: state.childcareSkipped.ideal }),
  }
}
