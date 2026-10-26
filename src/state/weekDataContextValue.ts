import { createContext, type Dispatch } from 'react'
import type { WeekResult } from '../lib/calc'
import type { WeekAction, WeekMode, WeekState } from './weekState'

export interface WeekData {
  state: WeekState
  dispatch: Dispatch<WeekAction>
  /** `calcWeek` results for both weeks, recomputed whenever the state changes. */
  results: Record<WeekMode, WeekResult>
}

export const WeekDataContext = createContext<WeekData | null>(null)
