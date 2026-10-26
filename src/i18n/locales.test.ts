import { describe, expect, it } from 'vitest'
import ar from './locales/ar.json'
import en from './locales/en.json'

type Tree = { [key: string]: string | Tree }

/** Every key path, with the text at that path. */
function flatten(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out.set(path, value)
    else for (const [k, v] of flatten(value, path)) out.set(k, v)
  }
  return out
}

/** Placeholders and tags that must survive translation, e.g. {{value}} and <b>. */
function tokens(text: string): string[] {
  return (text.match(/\{\{\w+\}\}|<\/?\w+>/g) ?? []).sort()
}

const english = flatten(en)
const arabic = flatten(ar)

describe('translations', () => {
  it('Arabic has exactly the same keys as English', () => {
    expect([...arabic.keys()].sort()).toEqual([...english.keys()].sort())
  })

  it.each([...english.keys()])('%s keeps the same placeholders and tags', (key) => {
    expect(tokens(arabic.get(key) ?? '')).toEqual(tokens(english.get(key) ?? ''))
  })

  it('has no empty strings', () => {
    for (const [key, text] of [...english, ...arabic]) expect(text.trim(), key).not.toBe('')
  })
})
