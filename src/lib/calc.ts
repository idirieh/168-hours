/**
 * Pure time-budget maths for the 168 Hours calculator.
 *
 * Every formula mirrors a cell in the original "⏳ 168 Hours Template" spreadsheet
 * (cell references are noted alongside). Inputs are assumed to be sanitised already
 * (non-negative, days within 0–7); see `sanitizeWeek` in `storage.ts`.
 */
import { AREA_IDS, type AreaId } from './areas'

export const HOURS_PER_WEEK = 168
export const DAYS_PER_WEEK = 7
export const WEEKDAYS = 5
export const WEEKEND_DAYS = 2
/** The spreadsheet treats a month as exactly four weeks. */
export const WEEKS_PER_MONTH = 4
export const WEEKS_PER_YEAR = 52

const MINUTES_PER_HOUR = 60

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface SleepInputs {
  hoursPerNight: number
  windDownMinutes: number
}

export interface WorkInputs {
  /** Excluding lunch break. */
  hoursPerDay: number
  daysPerWeek: number
  lunchBreakMinutes: number
  commuteMinutesEachWay: number
  getReadyMinutes: number
  changeAfterWorkMinutes: number
}

export interface FoodInputs {
  breakfastEatMinutes: number
  breakfastPrepMinutes: number
  /** Non-work days only: work-day lunch is counted under Work. */
  lunchEatMinutes: number
  lunchPrepMinutes: number
  dinnerEatMinutes: number
  dinnerPrepMinutes: number
}

export interface ChoresInputs {
  groceryTripsPerWeek: number
  minutesPerGroceryTrip: number
  cleaningsPerWeek: number
  minutesPerCleaning: number
  laundryLoadsPerWeek: number
  minutesPerLaundry: number
  miscHoursPerWeek: number
}

export interface ChildcareInputs {
  hoursPerWeekday: number
  hoursPerWeekendDay: number
  adminHoursPerWeek: number
  otherHoursPerWeek: number
}

export interface FitnessInputs {
  /** Including commute time. */
  exerciseHoursPerWeek: number
  otherHoursPerWeek: number
}

export interface EntertainmentInputs {
  tvMoviesHours: number
  socialMediaHours: number
  readingHours: number
  gamingHours: number
  otherHours: number
}

export interface RelationshipsInputs {
  familyPartnerHours: number
  otherSocialisingHours: number
}

export interface WeekInputs {
  sleep: SleepInputs
  work: WorkInputs
  food: FoodInputs
  chores: ChoresInputs
  childcare: ChildcareInputs
  fitness: FitnessInputs
  entertainment: EntertainmentInputs
  relationships: RelationshipsInputs
}

export function emptyWeek(): WeekInputs {
  return {
    sleep: { hoursPerNight: 0, windDownMinutes: 0 },
    work: {
      hoursPerDay: 0,
      daysPerWeek: 0,
      lunchBreakMinutes: 0,
      commuteMinutesEachWay: 0,
      getReadyMinutes: 0,
      changeAfterWorkMinutes: 0,
    },
    food: {
      breakfastEatMinutes: 0,
      breakfastPrepMinutes: 0,
      lunchEatMinutes: 0,
      lunchPrepMinutes: 0,
      dinnerEatMinutes: 0,
      dinnerPrepMinutes: 0,
    },
    chores: {
      groceryTripsPerWeek: 0,
      minutesPerGroceryTrip: 0,
      cleaningsPerWeek: 0,
      minutesPerCleaning: 0,
      laundryLoadsPerWeek: 0,
      minutesPerLaundry: 0,
      miscHoursPerWeek: 0,
    },
    childcare: {
      hoursPerWeekday: 0,
      hoursPerWeekendDay: 0,
      adminHoursPerWeek: 0,
      otherHoursPerWeek: 0,
    },
    fitness: { exerciseHoursPerWeek: 0, otherHoursPerWeek: 0 },
    entertainment: {
      tvMoviesHours: 0,
      socialMediaHours: 0,
      readingHours: 0,
      gamingHours: 0,
      otherHours: 0,
    },
    relationships: { familyPartnerHours: 0, otherSocialisingHours: 0 },
  }
}

// ---------------------------------------------------------------------------
// Per-area breakdowns (all values in hours per week unless named otherwise)
// ---------------------------------------------------------------------------

const toHours = (minutes: number) => minutes / MINUTES_PER_HOUR

export interface SleepResult {
  sleep: number
  windDown: number
  total: number
}

export function calcSleep(i: SleepInputs): SleepResult {
  const sleep = i.hoursPerNight * DAYS_PER_WEEK // F19
  const windDown = toHours(i.windDownMinutes * DAYS_PER_WEEK) // F20
  return { sleep, windDown, total: sleep + windDown } // F21
}

export interface WorkResult {
  official: number
  lunch: number
  commute: number
  getReady: number
  changeAfter: number
  total: number
}

export function calcWork(i: WorkInputs): WorkResult {
  const days = i.daysPerWeek
  const official = i.hoursPerDay * days // F26
  const lunch = toHours(i.lunchBreakMinutes * days) // F27
  const commute = toHours(i.commuteMinutesEachWay * 2 * days) // F28
  const getReady = toHours(i.getReadyMinutes * days) // F29
  const changeAfter = toHours(i.changeAfterWorkMinutes * days) // F30
  return {
    official,
    lunch,
    commute,
    getReady,
    changeAfter,
    total: official + lunch + commute + getReady + changeAfter, // F31
  }
}

export interface FoodResult {
  breakfastMinutesPerDay: number
  breakfast: number
  lunchMinutesPerDay: number
  lunch: number
  dinnerMinutesPerDay: number
  dinner: number
  total: number
}

/** `workDaysPerWeek` decides how many days need a home lunch (7 − work days). */
export function calcFood(i: FoodInputs, workDaysPerWeek: number): FoodResult {
  const breakfastMinutesPerDay = i.breakfastEatMinutes + i.breakfastPrepMinutes // F36
  const lunchMinutesPerDay = i.lunchEatMinutes + i.lunchPrepMinutes // F39
  const dinnerMinutesPerDay = i.dinnerEatMinutes + i.dinnerPrepMinutes // F42
  const breakfast = toHours(breakfastMinutesPerDay * DAYS_PER_WEEK) // F37
  const lunch = toHours(lunchMinutesPerDay * (DAYS_PER_WEEK - workDaysPerWeek)) // F40
  const dinner = toHours(dinnerMinutesPerDay * DAYS_PER_WEEK) // F43
  return {
    breakfastMinutesPerDay,
    breakfast,
    lunchMinutesPerDay,
    lunch,
    dinnerMinutesPerDay,
    dinner,
    total: breakfast + lunch + dinner, // F44
  }
}

export interface ChoresResult {
  groceries: number
  cleaning: number
  laundry: number
  misc: number
  total: number
}

export function calcChores(i: ChoresInputs): ChoresResult {
  const groceries = toHours(i.groceryTripsPerWeek * i.minutesPerGroceryTrip) // F49
  const cleaning = toHours(i.cleaningsPerWeek * i.minutesPerCleaning) // F51
  const laundry = toHours(i.laundryLoadsPerWeek * i.minutesPerLaundry) // F53
  const misc = i.miscHoursPerWeek // C54
  return { groceries, cleaning, laundry, misc, total: groceries + cleaning + laundry + misc } // F55
}

export interface ChildcareResult {
  weekdays: number
  weekends: number
  admin: number
  other: number
  total: number
}

export function calcChildcare(i: ChildcareInputs): ChildcareResult {
  const weekdays = i.hoursPerWeekday * WEEKDAYS // F59
  const weekends = i.hoursPerWeekendDay * WEEKEND_DAYS // F60
  const admin = i.adminHoursPerWeek // C61
  const other = i.otherHoursPerWeek // C62
  return { weekdays, weekends, admin, other, total: weekdays + weekends + admin + other } // F63
}

export interface TotalOnlyResult {
  total: number
}

export function calcFitness(i: FitnessInputs): TotalOnlyResult {
  // F69. (The template's Ideal column has a typo here, `M67+M67`; this is the intended sum.)
  return { total: i.exerciseHoursPerWeek + i.otherHoursPerWeek }
}

export function calcEntertainment(i: EntertainmentInputs): TotalOnlyResult {
  return {
    total: i.tvMoviesHours + i.socialMediaHours + i.readingHours + i.gamingHours + i.otherHours, // F78
  }
}

export function calcRelationships(i: RelationshipsInputs): TotalOnlyResult {
  return { total: i.familyPartnerHours + i.otherSocialisingHours } // F84
}

// ---------------------------------------------------------------------------
// Whole week
// ---------------------------------------------------------------------------

export interface WeekOptions {
  /** Childcare marked "not applicable": its total counts as 0 (inputs are kept). */
  childcareSkipped?: boolean
}

export interface WeekBreakdown {
  sleep: SleepResult
  work: WorkResult
  food: FoodResult
  chores: ChoresResult
  childcare: ChildcareResult
  fitness: TotalOnlyResult
  entertainment: TotalOnlyResult
  relationships: TotalOnlyResult
}

export interface Totals {
  used: number
  free: number
}

export interface WeekResult {
  breakdown: WeekBreakdown
  /** Hours per week for each area (what the summary table shows). */
  areas: Record<AreaId, number>
  /** Sum of all eight areas: "❌ Total Non-Free Time". */
  hoursUsed: number
  /** 168 − hoursUsed. Negative when over-allocated. */
  remaining: number
  /** "✅ Free Time", never below zero. */
  freeTime: number
  isOverAllocated: boolean
  /** How many hours past 168 the week is (0 when it fits). */
  overBy: number
  /** "✅ That leaves me with …" after each section, in section order. */
  remainingAfter: Record<AreaId, number>
  /** Share of the 168-hour week, 0–100. Free uses `freeTime`. */
  percentOfWeek: Record<AreaId | 'free', number>
  weekly: Totals
  monthly: Totals
  annual: Totals
}

export function calcWeek(week: WeekInputs, options: WeekOptions = {}): WeekResult {
  const childcare = calcChildcare(week.childcare)
  const breakdown: WeekBreakdown = {
    sleep: calcSleep(week.sleep),
    work: calcWork(week.work),
    food: calcFood(week.food, week.work.daysPerWeek),
    chores: calcChores(week.chores),
    childcare: options.childcareSkipped
      ? { weekdays: 0, weekends: 0, admin: 0, other: 0, total: 0 }
      : childcare,
    fitness: calcFitness(week.fitness),
    entertainment: calcEntertainment(week.entertainment),
    relationships: calcRelationships(week.relationships),
  }

  const areas = mapAreas((id) => breakdown[id].total)

  let running = HOURS_PER_WEEK
  const remainingAfter = mapAreas((id) => (running -= areas[id]))

  const hoursUsed = AREA_IDS.reduce((sum, id) => sum + areas[id], 0) // H16
  const remaining = HOURS_PER_WEEK - hoursUsed // H15
  const freeTime = Math.max(0, remaining)
  const overBy = Math.max(0, -remaining)

  const percentOfWeek = {
    ...mapAreas((id) => toPercent(areas[id])),
    free: toPercent(freeTime),
  }

  const weekly = { used: hoursUsed, free: freeTime }
  return {
    breakdown,
    areas,
    hoursUsed,
    remaining,
    freeTime,
    isOverAllocated: overBy > 0,
    overBy,
    remainingAfter,
    percentOfWeek,
    weekly,
    monthly: scaleTotals(weekly, WEEKS_PER_MONTH), // G3, G4
    annual: scaleTotals(weekly, WEEKS_PER_YEAR), // H3, H4
  }
}

// ---------------------------------------------------------------------------
// Current vs Ideal
// ---------------------------------------------------------------------------

export type CompareKey = AreaId | 'free' | 'used'

/**
 * Ideal minus current for each area, plus Free Time and Total Non-Free Time
 * (the Ideal tab's "VS CURRENT WEEK" column). Positive means more time in the
 * ideal week. Like the spreadsheet, free time is compared un-clamped so that
 * `free === -used` always holds.
 */
export function compareWeeks(current: WeekResult, ideal: WeekResult): Record<CompareKey, number> {
  return {
    ...mapAreas((id) => ideal.areas[id] - current.areas[id]),
    free: ideal.remaining - current.remaining,
    used: ideal.hoursUsed - current.hoursUsed,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapAreas<T>(fn: (id: AreaId) => T): Record<AreaId, T> {
  return Object.fromEntries(AREA_IDS.map((id) => [id, fn(id)])) as Record<AreaId, T>
}

function toPercent(hours: number) {
  return (hours / HOURS_PER_WEEK) * 100
}

function scaleTotals(t: Totals, factor: number): Totals {
  return { used: t.used * factor, free: t.free * factor }
}
