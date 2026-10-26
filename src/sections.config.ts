/**
 * Declarative layout of the eight fill-in-the-sentence sections.
 *
 * Each row is one input. Its sentence lives in the translation files under
 * `sections.<area>.rows.<field>` (`before` / `after`, with an optional `_ideal`
 * variant), and any computed lines it shows are read from the area's breakdown
 * in `calcWeek` and worded by `sections.<area>.results.<key>`.
 */
import type { AreaId } from './lib/areas'
import type { WeekBreakdown, WeekInputs } from './lib/calc'

export interface RowConfig<A extends AreaId> {
  field: keyof WeekInputs[A] & string
  /** Upper bound for the input (values above it are clamped). */
  max?: number
  /** Computed lines shown after this row, in order. */
  results?: (Exclude<keyof WeekBreakdown[A], 'total'> & string)[]
}

export interface SectionConfig<A extends AreaId> {
  rows: RowConfig<A>[]
  /** Optional sections can be skipped as "not applicable". */
  optional?: boolean
}

export type SectionsConfig = { [A in AreaId]: SectionConfig<A> }

const DAYS = 7
const HOURS_PER_DAY = 24
const HOURS_PER_WEEK = 168
const MINUTES_PER_DAY = 1440

export const SECTIONS: SectionsConfig = {
  sleep: {
    rows: [
      { field: 'hoursPerNight', max: HOURS_PER_DAY, results: ['sleep'] },
      { field: 'windDownMinutes', max: MINUTES_PER_DAY, results: ['windDown'] },
    ],
  },
  work: {
    rows: [
      { field: 'hoursPerDay', max: HOURS_PER_DAY },
      { field: 'daysPerWeek', max: DAYS, results: ['official'] },
      { field: 'lunchBreakMinutes', max: MINUTES_PER_DAY, results: ['lunch'] },
      { field: 'commuteMinutesEachWay', max: MINUTES_PER_DAY, results: ['commute'] },
      { field: 'getReadyMinutes', max: MINUTES_PER_DAY, results: ['getReady'] },
      { field: 'changeAfterWorkMinutes', max: MINUTES_PER_DAY, results: ['changeAfter'] },
    ],
  },
  food: {
    rows: [
      { field: 'breakfastEatMinutes', max: MINUTES_PER_DAY },
      {
        field: 'breakfastPrepMinutes',
        max: MINUTES_PER_DAY,
        results: ['breakfastMinutesPerDay', 'breakfast'],
      },
      { field: 'lunchEatMinutes', max: MINUTES_PER_DAY },
      { field: 'lunchPrepMinutes', max: MINUTES_PER_DAY, results: ['lunchMinutesPerDay', 'lunch'] },
      { field: 'dinnerEatMinutes', max: MINUTES_PER_DAY },
      {
        field: 'dinnerPrepMinutes',
        max: MINUTES_PER_DAY,
        results: ['dinnerMinutesPerDay', 'dinner'],
      },
    ],
  },
  chores: {
    rows: [
      { field: 'groceryTripsPerWeek' },
      { field: 'minutesPerGroceryTrip', max: MINUTES_PER_DAY, results: ['groceries'] },
      { field: 'cleaningsPerWeek' },
      { field: 'minutesPerCleaning', max: MINUTES_PER_DAY, results: ['cleaning'] },
      { field: 'laundryLoadsPerWeek' },
      { field: 'minutesPerLaundry', max: MINUTES_PER_DAY, results: ['laundry'] },
      { field: 'miscHoursPerWeek', max: HOURS_PER_WEEK },
    ],
  },
  childcare: {
    optional: true,
    rows: [
      { field: 'hoursPerWeekday', max: HOURS_PER_DAY, results: ['weekdays'] },
      { field: 'hoursPerWeekendDay', max: HOURS_PER_DAY, results: ['weekends'] },
      { field: 'adminHoursPerWeek', max: HOURS_PER_WEEK },
      { field: 'otherHoursPerWeek', max: HOURS_PER_WEEK },
    ],
  },
  fitness: {
    rows: [
      { field: 'exerciseHoursPerWeek', max: HOURS_PER_WEEK },
      { field: 'otherHoursPerWeek', max: HOURS_PER_WEEK },
    ],
  },
  entertainment: {
    rows: [
      { field: 'tvMoviesHours', max: HOURS_PER_WEEK },
      { field: 'socialMediaHours', max: HOURS_PER_WEEK },
      { field: 'readingHours', max: HOURS_PER_WEEK },
      { field: 'gamingHours', max: HOURS_PER_WEEK },
      { field: 'otherHours', max: HOURS_PER_WEEK },
    ],
  },
  relationships: {
    rows: [
      { field: 'familyPartnerHours', max: HOURS_PER_WEEK },
      { field: 'otherSocialisingHours', max: HOURS_PER_WEEK },
    ],
  },
}
