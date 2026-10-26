/**
 * Saving, loading, exporting and importing the two weeks.
 *
 * Everything stays in the browser. Stored or imported data is never trusted: it is
 * run through `sanitizeState`, which keeps only known fields with valid numbers and
 * caps them to the same limits the form uses.
 */
import { AREA_IDS } from './areas'
import { emptyWeek, type WeekInputs } from './calc'
import { clamp } from './parse'
import { SECTIONS } from '../sections.config'
import { WEEK_MODES, initialWeekState, type WeekState } from '../state/weekState'

export const STORAGE_KEY = '168-hours:data'
export const SCHEMA_VERSION = 1

/** The JSON shape written to localStorage and to exported files. */
export interface SavedData {
  app: '168-hours'
  version: typeof SCHEMA_VERSION
  savedAt: string
  weeks: WeekState['weeks']
  childcareSkipped: WeekState['childcareSkipped']
}

export function toSavedData(state: WeekState, now = new Date()): SavedData {
  return {
    app: '168-hours',
    version: SCHEMA_VERSION,
    savedAt: now.toISOString(),
    weeks: state.weeks,
    childcareSkipped: state.childcareSkipped,
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Field limits from the form config, so stored data obeys the same caps as typing. */
const MAX_BY_FIELD = Object.fromEntries(
  AREA_IDS.map((area) => [
    area,
    Object.fromEntries(
      (SECTIONS[area].rows as { field: string; max?: number }[]).map((r) => [r.field, r.max]),
    ),
  ]),
) as Record<string, Record<string, number | undefined>>

/** Copy known numeric fields from untrusted data onto an empty week. */
export function sanitizeWeek(raw: unknown): WeekInputs {
  const week = emptyWeek()
  if (!isRecord(raw)) return week
  for (const area of AREA_IDS) {
    const source = raw[area]
    if (!isRecord(source)) continue
    const target = week[area] as unknown as Record<string, number>
    for (const field of Object.keys(target)) {
      const value = source[field]
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) continue
      target[field] = clamp(value, 0, MAX_BY_FIELD[area]?.[field] ?? Number.MAX_SAFE_INTEGER)
    }
  }
  return week
}

/** Turn untrusted data into a valid state, or `null` if it isn't 168 Hours data at all. */
export function sanitizeState(raw: unknown): WeekState | null {
  if (!isRecord(raw) || raw.app !== '168-hours' || !isRecord(raw.weeks)) return null
  if (typeof raw.version !== 'number' || raw.version > SCHEMA_VERSION) return null
  const state = initialWeekState()
  const weeks = raw.weeks
  const skipped = isRecord(raw.childcareSkipped) ? raw.childcareSkipped : {}
  for (const mode of WEEK_MODES) {
    state.weeks[mode] = sanitizeWeek(weeks[mode])
    state.childcareSkipped[mode] = skipped[mode] === true
  }
  return state
}

/** Parse exported JSON text. Returns `null` for anything that isn't valid 168 Hours data. */
export function parseExport(text: string): WeekState | null {
  try {
    return sanitizeState(JSON.parse(text))
  } catch {
    return null
  }
}

export function loadState(storage: Storage | undefined = safeStorage()): WeekState | null {
  const text = readItem(storage, STORAGE_KEY)
  return text === null ? null : parseExport(text)
}

export function saveState(state: WeekState, storage: Storage | undefined = safeStorage()): void {
  writeItem(storage, STORAGE_KEY, JSON.stringify(toSavedData(state)))
}

// localStorage can be missing or throw (private mode, blocked site data), so every
// access goes through these helpers and failures are ignored.

export function safeStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function readItem(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeItem(storage: Storage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value)
  } catch {
    // Storage full or blocked: the app keeps working, it just won't remember.
  }
}
