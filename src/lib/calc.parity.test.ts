/**
 * Checks calc.ts against values computed by the original spreadsheet's own formulas.
 * Regenerate the fixture with `scripts/generate_parity_fixture.py`.
 */
import { describe, expect, it } from 'vitest'
import fixture from './__fixtures__/spreadsheet-parity.json'
import { calcWeek, compareWeeks, type WeekInputs, type WeekResult } from './calc'

/** Expected values for the sheet's un-clamped "HOURS FREE" monthly/annual cells. */
const RAW_TOTALS: Record<string, (r: WeekResult) => number> = {
  monthlyRemaining: (r) => r.remaining * 4,
  annualRemaining: (r) => r.remaining * 52,
}

function valueAt(result: WeekResult, path: string): number {
  const raw = RAW_TOTALS[path]
  if (raw) return raw(result)
  const value = path
    .split('.')
    .reduce<unknown>((obj, key) => (obj as Record<string, unknown>)[key], result)
  if (typeof value !== 'number') throw new Error(`No numeric result at "${path}"`)
  return value
}

describe.each(fixture.scenarios)('spreadsheet parity: $name', (scenario) => {
  const current = calcWeek(scenario.current as WeekInputs)
  const ideal = calcWeek(scenario.ideal as WeekInputs)

  it.each(Object.entries(scenario.expected.current))('current week %s', (path, expected) => {
    expect(valueAt(current, path)).toBeCloseTo(expected, 9)
  })

  it.each(Object.entries(scenario.expected.ideal))('ideal week %s', (path, expected) => {
    expect(valueAt(ideal, path)).toBeCloseTo(expected, 9)
  })

  it.each(Object.entries(scenario.expected.vsCurrent))('vs current week %s', (key, expected) => {
    const diff = compareWeeks(current, ideal)
    expect(diff[key as keyof typeof diff]).toBeCloseTo(expected, 9)
  })
})
