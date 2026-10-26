import { describe, expect, it } from 'vitest'
import { calcWeek, compareWeeks, emptyWeek } from './calc'
import { pickInsight } from './insight'

function diffOf(
  edit: (current: ReturnType<typeof emptyWeek>, ideal: ReturnType<typeof emptyWeek>) => void,
) {
  const current = emptyWeek()
  const ideal = emptyWeek()
  edit(current, ideal)
  return compareWeeks(calcWeek(current), calcWeek(ideal))
}

describe('pickInsight', () => {
  it('finds the biggest gain and the biggest loss', () => {
    const diff = diffOf((current, ideal) => {
      current.entertainment.tvMoviesHours = 10
      ideal.entertainment.tvMoviesHours = 6
      current.chores.miscHoursPerWeek = 3
      ideal.chores.miscHoursPerWeek = 2
      ideal.fitness.exerciseHoursPerWeek = 6
      ideal.sleep.hoursPerNight = 0.5
    })
    expect(pickInsight(diff)).toEqual({
      gain: { area: 'fitness', hours: 6 },
      loss: { area: 'entertainment', hours: 4 },
    })
  })

  it('reports nothing when the weeks match', () => {
    expect(pickInsight(diffOf(() => {}))).toEqual({ gain: null, loss: null })
  })

  it('ignores changes too small to show', () => {
    const diff = diffOf((current, ideal) => {
      current.relationships.familyPartnerHours = 2
      ideal.relationships.familyPartnerHours = 2.01
    })
    expect(pickInsight(diff)).toEqual({ gain: null, loss: null })
  })

  it('can have only a gain or only a loss', () => {
    const onlyLoss = diffOf((current) => {
      current.work.hoursPerDay = 8
      current.work.daysPerWeek = 5
    })
    expect(pickInsight(onlyLoss)).toEqual({ gain: null, loss: { area: 'work', hours: 40 } })
  })
})
