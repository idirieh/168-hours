import { describe, expect, it } from 'vitest'
import en from './i18n/locales/en.json'
import { AREA_IDS } from './lib/areas'
import { calcWeek, emptyWeek } from './lib/calc'
import { SECTIONS } from './sections.config'

const empty = emptyWeek()
const breakdown = calcWeek(empty).breakdown

function lookup(path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((obj, key) => (obj as Record<string, unknown> | undefined)?.[key], en)
}

describe.each(AREA_IDS)('%s section config', (area) => {
  const rows = SECTIONS[area].rows as { field: string; results?: string[] }[]

  it('covers every input field exactly once', () => {
    expect(rows.map((r) => r.field).sort()).toEqual(Object.keys(empty[area]).sort())
  })

  it('only shows results that calcWeek produces', () => {
    for (const key of rows.flatMap((r) => r.results ?? [])) {
      expect(breakdown[area]).toHaveProperty(key)
    }
  })

  it('has English text for every sentence and result', () => {
    expect(lookup(`sections.${area}.total`)).toEqual(expect.any(String))
    for (const row of rows) {
      expect(lookup(`sections.${area}.rows.${row.field}.before`)).toEqual(expect.any(String))
      expect(lookup(`sections.${area}.rows.${row.field}.after`)).toEqual(expect.any(String))
      for (const key of row.results ?? []) {
        expect(lookup(`sections.${area}.results.${key}`)).toMatch(/<b>\{\{value\}\}<\/b>/)
      }
    }
  })
})
