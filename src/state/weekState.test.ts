import { describe, expect, it } from 'vitest'
import { initialWeekState, weekReducer } from './weekState'

describe('weekReducer', () => {
  it('sets one field without touching the other week', () => {
    const before = initialWeekState()
    const after = weekReducer(before, {
      type: 'setField',
      mode: 'current',
      area: 'sleep',
      field: 'hoursPerNight',
      value: 7,
    })
    expect(after.weeks.current.sleep.hoursPerNight).toBe(7)
    expect(after.weeks.ideal.sleep.hoursPerNight).toBe(0)
    expect(before.weeks.current.sleep.hoursPerNight).toBe(0)
  })

  it('ignores unknown fields and unchanged values', () => {
    const state = initialWeekState()
    expect(
      weekReducer(state, {
        type: 'setField',
        mode: 'current',
        area: 'sleep',
        field: 'x',
        value: 1,
      }),
    ).toBe(state)
    expect(
      weekReducer(state, {
        type: 'setField',
        mode: 'current',
        area: 'sleep',
        field: 'hoursPerNight',
        value: 0,
      }),
    ).toBe(state)
  })

  it('copies the current week into the ideal week as an independent copy', () => {
    let state = weekReducer(initialWeekState(), {
      type: 'setField',
      mode: 'current',
      area: 'work',
      field: 'daysPerWeek',
      value: 5,
    })
    state = weekReducer(state, { type: 'setChildcareSkipped', mode: 'current', skipped: true })
    state = weekReducer(state, { type: 'copyCurrentToIdeal' })
    expect(state.weeks.ideal.work.daysPerWeek).toBe(5)
    expect(state.childcareSkipped.ideal).toBe(true)
    expect(state.weeks.ideal).not.toBe(state.weeks.current)
    expect(state.weeks.ideal.work).not.toBe(state.weeks.current.work)
  })

  it('resets to empty weeks', () => {
    const state = weekReducer(initialWeekState(), {
      type: 'setChildcareSkipped',
      mode: 'ideal',
      skipped: true,
    })
    expect(weekReducer(state, { type: 'reset' })).toEqual(initialWeekState())
  })
})
