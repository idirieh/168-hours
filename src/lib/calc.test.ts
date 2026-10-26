import { describe, expect, it } from 'vitest'
import { AREA_IDS } from './areas'
import {
  calcChildcare,
  calcChores,
  calcEntertainment,
  calcFitness,
  calcFood,
  calcRelationships,
  calcSleep,
  calcWeek,
  calcWork,
  compareWeeks,
  emptyWeek,
  type WeekInputs,
} from './calc'

/** Build a week from an empty one plus per-area overrides. */
function week(overrides: { [K in keyof WeekInputs]?: Partial<WeekInputs[K]> } = {}): WeekInputs {
  const base = emptyWeek()
  for (const key of Object.keys(overrides) as (keyof WeekInputs)[]) {
    Object.assign(base[key], overrides[key])
  }
  return base
}

describe('zeros', () => {
  it('an empty week uses no hours and leaves all 168 free', () => {
    const r = calcWeek(emptyWeek())
    for (const id of AREA_IDS) expect(r.areas[id]).toBe(0)
    expect(r.hoursUsed).toBe(0)
    expect(r.remaining).toBe(168)
    expect(r.freeTime).toBe(168)
    expect(r.isOverAllocated).toBe(false)
    expect(r.overBy).toBe(0)
    expect(r.percentOfWeek.free).toBe(100)
  })

  it('every area breakdown is all zeros', () => {
    const w = emptyWeek()
    expect(calcSleep(w.sleep)).toEqual({ sleep: 0, windDown: 0, total: 0 })
    expect(calcWork(w.work).total).toBe(0)
    expect(calcFood(w.food, 0).total).toBe(0)
    expect(calcChores(w.chores).total).toBe(0)
    expect(calcChildcare(w.childcare).total).toBe(0)
    expect(calcFitness(w.fitness).total).toBe(0)
    expect(calcEntertainment(w.entertainment).total).toBe(0)
    expect(calcRelationships(w.relationships).total).toBe(0)
  })
})

describe('sleep', () => {
  it('matches the spreadsheet example: 7 h/night + 30 min wind-down', () => {
    const r = calcWeek(week({ sleep: { hoursPerNight: 7, windDownMinutes: 30 } }))
    expect(r.breakdown.sleep).toEqual({ sleep: 49, windDown: 3.5, total: 52.5 })
    expect(r.remainingAfter.sleep).toBe(115.5)
    expect(r.remaining).toBe(115.5)
  })
})

describe('work', () => {
  it('multiplies every per-day line by work days, commute both ways', () => {
    const r = calcWork({
      hoursPerDay: 8,
      daysPerWeek: 5,
      lunchBreakMinutes: 60,
      commuteMinutesEachWay: 30,
      getReadyMinutes: 30,
      changeAfterWorkMinutes: 12,
    })
    expect(r).toEqual({
      official: 40,
      lunch: 5,
      commute: 5,
      getReady: 2.5,
      changeAfter: 1,
      total: 53.5,
    })
  })

  it('0 work days means no work time at all', () => {
    const r = calcWork({ ...emptyWeek().work, hoursPerDay: 8, lunchBreakMinutes: 60 })
    expect(r.total).toBe(0)
  })
})

describe('food', () => {
  const food = {
    breakfastEatMinutes: 10,
    breakfastPrepMinutes: 5,
    lunchEatMinutes: 20,
    lunchPrepMinutes: 10,
    dinnerEatMinutes: 30,
    dinnerPrepMinutes: 30,
  }

  it('adds eating and prep per meal, and counts lunch on non-work days only', () => {
    const r = calcFood(food, 5)
    expect(r.breakfastMinutesPerDay).toBe(15)
    expect(r.breakfast).toBe(1.75)
    expect(r.lunchMinutesPerDay).toBe(30)
    expect(r.lunch).toBe(1) // 30 min × 2 days
    expect(r.dinnerMinutesPerDay).toBe(60)
    expect(r.dinner).toBe(7)
    expect(r.total).toBe(9.75)
  })

  it('a 7-day work week has no non-work-day lunch', () => {
    expect(calcFood(food, 7).lunch).toBe(0)
  })

  it('0 work days means lunch every day', () => {
    expect(calcFood(food, 0).lunch).toBe(3.5)
  })

  it('uses work days from the Work section', () => {
    const r = calcWeek(week({ food, work: { daysPerWeek: 6 } }))
    expect(r.breakdown.food.lunch).toBe(0.5)
  })
})

describe('chores', () => {
  it('sums sessions × minutes, plus misc hours entered directly', () => {
    const r = calcChores({
      groceryTripsPerWeek: 1,
      minutesPerGroceryTrip: 90,
      cleaningsPerWeek: 2,
      minutesPerCleaning: 45,
      laundryLoadsPerWeek: 3,
      minutesPerLaundry: 20,
      miscHoursPerWeek: 1.25,
    })
    expect(r).toEqual({ groceries: 1.5, cleaning: 1.5, laundry: 1, misc: 1.25, total: 5.25 })
  })
})

describe('childcare', () => {
  const childcare = {
    hoursPerWeekday: 2,
    hoursPerWeekendDay: 5,
    adminHoursPerWeek: 1,
    otherHoursPerWeek: 0.5,
  }

  it('weekdays × 5, weekend days × 2, plus weekly extras', () => {
    expect(calcChildcare(childcare)).toEqual({
      weekdays: 10,
      weekends: 10,
      admin: 1,
      other: 0.5,
      total: 21.5,
    })
  })

  it('counts as zero when skipped', () => {
    const r = calcWeek(week({ childcare }), { childcareSkipped: true })
    expect(r.areas.childcare).toBe(0)
    expect(r.remaining).toBe(168)
  })
})

describe('fitness, entertainment, relationships', () => {
  it('fitness adds exercise and other (not exercise twice, as the template typo did)', () => {
    expect(calcFitness({ exerciseHoursPerWeek: 3, otherHoursPerWeek: 1 }).total).toBe(4)
  })

  it('entertainment sums all five lines', () => {
    expect(
      calcEntertainment({
        tvMoviesHours: 7,
        socialMediaHours: 10.5,
        readingHours: 3,
        gamingHours: 2,
        otherHours: 1,
      }).total,
    ).toBe(23.5)
  })

  it('relationships sums both lines', () => {
    expect(calcRelationships({ familyPartnerHours: 6, otherSocialisingHours: 4 }).total).toBe(10)
  })
})

describe('decimals', () => {
  it('handles fractional hours and minutes', () => {
    const r = calcWeek(
      week({
        sleep: { hoursPerNight: 7.5, windDownMinutes: 22.5 },
        work: { hoursPerDay: 7.25, daysPerWeek: 4.5 },
      }),
    )
    expect(r.breakdown.sleep.sleep).toBeCloseTo(52.5)
    expect(r.breakdown.sleep.windDown).toBeCloseTo(2.625)
    expect(r.breakdown.work.official).toBeCloseTo(32.625)
    expect(r.hoursUsed).toBeCloseTo(87.75)
  })
})

describe('summary maths', () => {
  const r = calcWeek(
    week({
      sleep: { hoursPerNight: 8 },
      work: { hoursPerDay: 8, daysPerWeek: 5 },
    }),
  )

  it('totals hours used and free', () => {
    expect(r.hoursUsed).toBe(96)
    expect(r.freeTime).toBe(72)
    expect(r.weekly).toEqual({ used: 96, free: 72 })
  })

  it('monthly is × 4 and annual is × 52, as in the spreadsheet', () => {
    expect(r.monthly).toEqual({ used: 384, free: 288 })
    expect(r.annual).toEqual({ used: 4992, free: 3744 })
  })

  it('gives each area a share of the 168-hour week', () => {
    expect(r.percentOfWeek.sleep).toBeCloseTo(33.333)
    expect(r.percentOfWeek.work).toBeCloseTo(23.81)
    expect(r.percentOfWeek.free).toBeCloseTo(42.857)
    const total = Object.values(r.percentOfWeek).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(100)
  })

  it('tracks the running "that leaves me with" remainder after each section', () => {
    expect(r.remainingAfter.sleep).toBe(112)
    expect(r.remainingAfter.work).toBe(72)
    expect(r.remainingAfter.relationships).toBe(72)
  })
})

describe('over 168 hours', () => {
  const r = calcWeek(
    week({
      sleep: { hoursPerNight: 10 },
      work: { hoursPerDay: 14, daysPerWeek: 7 },
      entertainment: { socialMediaHours: 10 },
    }),
  )

  it('flags the week and reports how far over it is', () => {
    expect(r.hoursUsed).toBe(178)
    expect(r.isOverAllocated).toBe(true)
    expect(r.overBy).toBe(10)
    expect(r.remaining).toBe(-10)
  })

  it('never lets free time go negative', () => {
    expect(r.freeTime).toBe(0)
    expect(r.weekly.free).toBe(0)
    expect(r.monthly.free).toBe(0)
    expect(r.annual.free).toBe(0)
    expect(r.percentOfWeek.free).toBe(0)
  })

  it('exactly 168 is not over-allocated', () => {
    const exact = calcWeek(week({ sleep: { hoursPerNight: 24 } }))
    expect(exact.remaining).toBe(0)
    expect(exact.isOverAllocated).toBe(false)
  })
})

describe('compareWeeks', () => {
  it('reports ideal minus current per area, free and used', () => {
    const current = calcWeek(
      week({ fitness: { exerciseHoursPerWeek: 1 }, entertainment: { tvMoviesHours: 10 } }),
    )
    const ideal = calcWeek(
      week({ fitness: { exerciseHoursPerWeek: 7 }, entertainment: { tvMoviesHours: 6 } }),
    )
    const diff = compareWeeks(current, ideal)
    expect(diff.fitness).toBe(6)
    expect(diff.entertainment).toBe(-4)
    expect(diff.sleep).toBe(0)
    expect(diff.used).toBe(2)
    expect(diff.free).toBe(-2)
  })
})
