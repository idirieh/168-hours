import { describe, expect, it } from 'vitest'
import { emptyWeek } from './calc'
import {
  STORAGE_KEY,
  loadState,
  parseExport,
  sanitizeState,
  sanitizeWeek,
  saveState,
  toSavedData,
} from './storage'
import { initialWeekState } from '../state/weekState'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => map.delete(k),
    setItem: (k, v) => map.set(k, v),
  }
}

function sampleState() {
  const state = initialWeekState()
  state.weeks.current.sleep.hoursPerNight = 7.5
  state.weeks.current.work.daysPerWeek = 5
  state.weeks.ideal.fitness.exerciseHoursPerWeek = 4
  state.childcareSkipped.ideal = true
  return state
}

describe('sanitizeWeek', () => {
  it('returns an empty week for junk', () => {
    expect(sanitizeWeek(null)).toEqual(emptyWeek())
    expect(sanitizeWeek('hello')).toEqual(emptyWeek())
    expect(sanitizeWeek([1, 2])).toEqual(emptyWeek())
  })

  it('keeps valid numbers and drops unknown, negative or non-numeric fields', () => {
    const week = sanitizeWeek({
      sleep: { hoursPerNight: 8, windDownMinutes: -5, extra: 3 },
      work: { hoursPerDay: '8', daysPerWeek: Number.NaN },
      hacker: { x: 1 },
    })
    expect(week.sleep).toEqual({ hoursPerNight: 8, windDownMinutes: 0 })
    expect(week.work.hoursPerDay).toBe(0)
    expect(week.work.daysPerWeek).toBe(0)
    expect(week).not.toHaveProperty('hacker')
  })

  it('caps values to the form limits', () => {
    const week = sanitizeWeek({ work: { daysPerWeek: 9 }, sleep: { hoursPerNight: 30 } })
    expect(week.work.daysPerWeek).toBe(7)
    expect(week.sleep.hoursPerNight).toBe(24)
  })
})

describe('sanitizeState', () => {
  it('round-trips saved data', () => {
    const state = sampleState()
    expect(sanitizeState(JSON.parse(JSON.stringify(toSavedData(state))))).toEqual(state)
  })

  it('rejects data that is not ours or from a newer version', () => {
    expect(sanitizeState({ weeks: {} })).toBeNull()
    expect(sanitizeState({ app: 'other', version: 1, weeks: {} })).toBeNull()
    expect(sanitizeState({ app: '168-hours', version: 99, weeks: {} })).toBeNull()
  })

  it('fills in missing weeks and flags', () => {
    const state = sanitizeState({ app: '168-hours', version: 1, weeks: {} })
    expect(state).toEqual(initialWeekState())
  })
})

describe('parseExport', () => {
  it('returns null for invalid JSON', () => {
    expect(parseExport('{not json')).toBeNull()
    expect(parseExport('')).toBeNull()
  })
})

describe('saveState / loadState', () => {
  it('saves to and restores from storage', () => {
    const storage = memoryStorage()
    expect(loadState(storage)).toBeNull()
    saveState(sampleState(), storage)
    expect(storage.getItem(STORAGE_KEY)).toContain('"app":"168-hours"')
    expect(loadState(storage)).toEqual(sampleState())
  })

  it('survives storage that throws or is missing', () => {
    const broken = memoryStorage()
    broken.getItem = () => {
      throw new Error('blocked')
    }
    broken.setItem = () => {
      throw new Error('full')
    }
    expect(loadState(broken)).toBeNull()
    expect(() => saveState(sampleState(), broken)).not.toThrow()
    expect(loadState(undefined)).toBeNull()
  })
})
