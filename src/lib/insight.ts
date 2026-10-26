/** Picks what the Compare page's one-line insight should talk about. Pure, no React. */
import { AREA_IDS, type AreaId } from './areas'
import type { CompareKey } from './calc'

export interface InsightChange {
  area: AreaId
  hours: number
}

export interface Insight {
  /** The area that gains the most time in the ideal week, if any. */
  gain: InsightChange | null
  /** The area that loses the most time in the ideal week, if any (hours is positive). */
  loss: InsightChange | null
}

/** Differences smaller than this show as 0.0, so they don't count as a change. */
const MIN_CHANGE = 0.05

export function pickInsight(diff: Record<CompareKey, number>): Insight {
  let gain: InsightChange | null = null
  let loss: InsightChange | null = null
  for (const area of AREA_IDS) {
    const d = diff[area]
    if (d >= MIN_CHANGE && d > (gain?.hours ?? 0)) gain = { area, hours: d }
    if (d <= -MIN_CHANGE && -d > (loss?.hours ?? 0)) loss = { area, hours: -d }
  }
  return { gain, loss }
}
