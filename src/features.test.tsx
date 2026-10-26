import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import { STORAGE_KEY, toSavedData } from './lib/storage'
import { initialWeekState, type WeekState } from './state/weekState'

function renderAt(hash: string, initialState?: WeekState) {
  window.location.hash = hash
  const utils = render(<App {...(initialState && { initialState })} />)
  return { user: userEvent.setup(), ...utils }
}

const summary = () => within(screen.getByRole('complementary'))
const region = (name: RegExp) => within(screen.getByRole('region', { name }))
const rowOf = (table: HTMLElement, name: RegExp) =>
  within(within(table).getByRole('rowheader', { name }).closest('tr') as HTMLElement)
const cellText = (row: ReturnType<typeof rowOf>) =>
  row.getAllByRole('cell').map((c) => c.textContent)

function sampleState() {
  const state = initialWeekState()
  state.weeks.current.sleep = { hoursPerNight: 7, windDownMinutes: 30 }
  state.weeks.current.entertainment.tvMoviesHours = 10
  state.weeks.ideal.sleep = { hoursPerNight: 7, windDownMinutes: 30 }
  state.weeks.ideal.entertainment.tvMoviesHours = 6
  state.weeks.ideal.fitness.exerciseHoursPerWeek = 6
  return state
}

describe('landing page', () => {
  it('explains the idea, credits the book and starts the current week', async () => {
    const { user } = renderAt('')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/168 hours go/)
    const bookLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('https://lauravanderkam.com'))
    expect(bookLinks.length).toBeGreaterThanOrEqual(2) // Intro and footer.
    expect(bookLinks[0]).toHaveAttribute('href', 'https://lauravanderkam.com/books/168-hours/')
    const aliLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === 'https://aliabdaal.com/')
    expect(aliLinks).toHaveLength(2) // Intro and footer.

    await user.click(screen.getByRole('link', { name: /start with my current week/i }))
    expect(screen.getByRole('heading', { level: 1, name: /current week/i })).toBeInTheDocument()
  })
})

describe('summary panel', () => {
  it('shows weekly, monthly and annual totals and the area table', async () => {
    const { user } = renderAt('#/week/current')
    await user.type(region(/sleep/i).getByRole('textbox', { name: /I sleep for around/ }), '7')
    await user.type(region(/sleep/i).getByRole('textbox', { name: /I wind down for/ }), '30')

    const [totals, areas] = summary().getAllByRole('table') as [HTMLElement, HTMLElement]
    expect(cellText(rowOf(totals, /hours free/i))).toEqual(['115.5', '462.0', '6,006.0'])
    expect(cellText(rowOf(totals, /hours used/i))).toEqual(['52.5', '210.0', '2,730.0'])

    expect(cellText(rowOf(areas, /sleep/i))).toEqual(['52.5', '31.3'])
    expect(cellText(rowOf(areas, /^free time$/i))).toEqual(['115.5', '68.8'])
    expect(cellText(rowOf(areas, /non-free/i))).toEqual(['52.5', '31.3'])
    expect(summary().queryByRole('alert')).not.toBeInTheDocument()
  })

  it('warns when more than 168 hours are allocated', async () => {
    const { user } = renderAt('#/week/current')
    await user.type(region(/sleep/i).getByRole('textbox', { name: /I sleep for around/ }), '24')
    await user.type(region(/fitness/i).getByRole('textbox', { name: /hours exercising/ }), '10')

    const alert = summary().getByRole('alert')
    expect(alert).toHaveTextContent("You've allocated more than 168 hours")
    expect(alert).toHaveTextContent('10.0')
    const [totals] = summary().getAllByRole('table') as [HTMLElement]
    expect(cellText(rowOf(totals, /hours free/i))[0]).toBe('0.0')
  })

  it('offers a PNG download', () => {
    renderAt('#/week/current')
    expect(summary().getByRole('button', { name: /download as png/i })).toBeEnabled()
  })
})

describe('ideal week', () => {
  it('copies the current week and shows the difference column', async () => {
    const state = initialWeekState()
    state.weeks.current.sleep.hoursPerNight = 8
    const { user } = renderAt('#/week/ideal', state)

    await user.click(screen.getByRole('button', { name: /copy from current week/i }))
    const box = region(/sleep/i).getByRole('textbox', { name: /I'd like to sleep/ })
    expect(box).toHaveValue('8')

    await user.clear(box)
    await user.type(box, '9')
    const [, areas] = summary().getAllByRole('table') as [HTMLElement, HTMLElement]
    expect(cellText(rowOf(areas, /sleep/i))).toEqual(['63.0', '37.5', '+7.0'])
  })

  it('asks before overwriting an ideal week that has its own data', async () => {
    const { user } = renderAt('#/week/ideal', sampleState())
    await user.click(screen.getByRole('button', { name: /copy from current week/i }))
    const group = screen.getByRole('group', { name: /replaces your ideal week/i })
    await user.click(within(group).getByRole('button', { name: /cancel/i }))
    expect(region(/fitness/i).getByRole('textbox', { name: /hours exercising/ })).toHaveValue('6')
  })
})

describe('compare page', () => {
  it('asks for data when both weeks are empty', () => {
    renderAt('#/compare')
    expect(screen.getByText(/to compare them/)).toBeInTheDocument()
  })

  it('shows the difference per area and a plain-language insight', () => {
    renderAt('#/compare', sampleState())
    expect(screen.getByText(/you'd gain/)).toHaveTextContent(
      "In your ideal week you'd gain 6.0 hours of fitness and lose 4.0 hours of entertainment.",
    )
    const table = screen.getByRole('table')
    expect(cellText(rowOf(table, /fitness/i))).toEqual(['0.0', '6.0', '+6.0'])
    expect(cellText(rowOf(table, /entertainment/i))[2]).toBe('-4.0')
    expect(cellText(rowOf(table, /^✅ free time$/i))[2]).toBe('-2.0')
  })
})

describe('saving, export and import', () => {
  it('restores what was typed after a reload', async () => {
    const { user, unmount } = renderAt('#/week/current')
    await user.type(region(/sleep/i).getByRole('textbox', { name: /I sleep for around/ }), '7.5')
    unmount()
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('7.5')

    render(<App />)
    expect(region(/sleep/i).getByRole('textbox', { name: /I sleep for around/ })).toHaveValue('7.5')
  })

  it('imports a valid export and rejects anything else', async () => {
    const { user } = renderAt('#/week/current')
    const input = screen.getByLabelText('Import JSON', { selector: 'input' })

    await user.upload(input, new File(['{"hello": 1}'], 'nope.json', { type: 'application/json' }))
    expect(await screen.findByText(/isn't a 168 Hours export/)).toBeInTheDocument()

    const json = JSON.stringify(toSavedData(sampleState()))
    await user.upload(input, new File([json], 'backup.json', { type: 'application/json' }))
    expect(await screen.findByText(/imported your data/i)).toBeInTheDocument()
    expect(region(/entertainment/i).getByRole('textbox', { name: /watching TV/ })).toHaveValue('10')
  })

  it('resets everything after confirming', async () => {
    const { user } = renderAt('#/week/current', sampleState())
    await user.click(screen.getByRole('button', { name: /reset everything/i }))
    await user.click(screen.getByRole('button', { name: /yes, reset everything/i }))
    expect(screen.getByText(/everything has been reset/i)).toBeInTheDocument()
    expect(region(/sleep/i).getByRole('textbox', { name: /I sleep for around/ })).toHaveValue('')
  })
})

describe('language and theme', () => {
  it('switches to Arabic with right-to-left layout', async () => {
    const { user } = renderAt('#/week/current')
    await user.click(screen.getByRole('button', { name: /switch to arabic/i }))
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أسبوعي الحالي')
    expect(window.localStorage.getItem('168-hours:language')).toBe('ar')

    await user.click(screen.getByRole('button', { name: /الإنجليزية/ }))
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })

  it('remembers a forced dark or light theme', async () => {
    const { user } = renderAt('#/week/current')
    await user.selectOptions(screen.getByRole('combobox', { name: /theme/i }), 'dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem('168-hours:theme')).toBe('"dark"')
    await user.selectOptions(screen.getByRole('combobox', { name: /theme/i }), 'system')
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })
})
