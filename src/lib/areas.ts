/** The eight life areas, in the order the spreadsheet lists them. */
export const AREA_IDS = [
  'sleep',
  'work',
  'food',
  'chores',
  'childcare',
  'fitness',
  'entertainment',
  'relationships',
] as const

export type AreaId = (typeof AREA_IDS)[number]

export const AREA_EMOJI: Record<AreaId, string> = {
  sleep: '😴',
  work: '💻',
  food: '🍕',
  chores: '🧹',
  childcare: '👶',
  fitness: '🏋️',
  entertainment: '📺',
  relationships: '🥰',
}

export const FREE_EMOJI = '✅'
export const USED_EMOJI = '❌'
