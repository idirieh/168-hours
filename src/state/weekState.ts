/** App state for both weeks and the reducer that updates it. Pure, no React. */
import type { AreaId } from '../lib/areas'
import { emptyWeek, type WeekInputs } from '../lib/calc'

export const WEEK_MODES = ['current', 'ideal'] as const
export type WeekMode = (typeof WEEK_MODES)[number]

export interface WeekState {
  weeks: Record<WeekMode, WeekInputs>
  childcareSkipped: Record<WeekMode, boolean>
}

export type WeekAction =
  | { type: 'setField'; mode: WeekMode; area: AreaId; field: string; value: number }
  | { type: 'setChildcareSkipped'; mode: WeekMode; skipped: boolean }
  | { type: 'copyCurrentToIdeal' }
  | { type: 'replace'; state: WeekState }
  | { type: 'reset' }

export function initialWeekState(): WeekState {
  return {
    weeks: { current: emptyWeek(), ideal: emptyWeek() },
    childcareSkipped: { current: false, ideal: false },
  }
}

export function weekReducer(state: WeekState, action: WeekAction): WeekState {
  switch (action.type) {
    case 'setField': {
      const week = state.weeks[action.mode]
      const area = week[action.area] as unknown as Record<string, number>
      if (!(action.field in area) || area[action.field] === action.value) return state
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.mode]: { ...week, [action.area]: { ...area, [action.field]: action.value } },
        },
      }
    }
    case 'setChildcareSkipped':
      return {
        ...state,
        childcareSkipped: { ...state.childcareSkipped, [action.mode]: action.skipped },
      }
    case 'copyCurrentToIdeal':
      return {
        weeks: { ...state.weeks, ideal: structuredClone(state.weeks.current) },
        childcareSkipped: { ...state.childcareSkipped, ideal: state.childcareSkipped.current },
      }
    case 'replace':
      return action.state
    case 'reset':
      return initialWeekState()
  }
}
