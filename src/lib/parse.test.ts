import { describe, expect, it } from 'vitest'
import { clamp, parseNumberInput } from './parse'

describe('parseNumberInput', () => {
  it.each([
    ['', 0],
    ['   ', 0],
    ['7', 7],
    ['7.5', 7.5],
    ['7,5', 7.5],
    ['.5', 0.5],
    ['5.', 5],
    [' 30 ', 30],
    ['٧', 7],
    ['٧٫٥', 7.5],
    ['۱۲', 12],
  ])('parses %j as %d', (raw, expected) => {
    expect(parseNumberInput(raw)).toBe(expected)
  })

  it.each(['abc', '-3', '1.2.3', '.', '1e3', '7 h', '+4'])('rejects %j', (raw) => {
    expect(parseNumberInput(raw)).toBeNull()
  })
})

describe('clamp', () => {
  it('keeps values within range', () => {
    expect(clamp(9, 0, 7)).toBe(7)
    expect(clamp(-1, 0, 7)).toBe(0)
    expect(clamp(3.5, 0, 7)).toBe(3.5)
  })
})
