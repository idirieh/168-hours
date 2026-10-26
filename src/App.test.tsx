import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

function renderAt(hash: string) {
  window.location.hash = hash
  render(<App />)
  return userEvent.setup()
}

function section(name: RegExp) {
  return within(screen.getByRole('region', { name }))
}

describe('week form', () => {
  it('shows all eight sections on the current week', () => {
    renderAt('#/week/current')
    expect(screen.getByRole('heading', { level: 1, name: /current week/i })).toBeInTheDocument()
    expect(screen.getAllByRole('region')).toHaveLength(8)
  })

  it('updates results, totals and the running remainder as you type', async () => {
    const user = renderAt('#/week/current')
    const sleep = section(/sleep/i)

    await user.type(sleep.getByRole('textbox', { name: /I sleep for around/ }), '7')
    await user.type(sleep.getByRole('textbox', { name: /I wind down for/ }), '30')

    expect(sleep.getByText(/hours per week sleeping/)).toHaveTextContent('49.0')
    expect(sleep.getByText(/preparing to sleep/)).toHaveTextContent('3.5')
    expect(sleep.getByText(/In total/)).toHaveTextContent('52.5')
    expect(sleep.getByText(/That leaves me with/)).toHaveTextContent('115.5')
    // The last section's remainder is the week's free time.
    expect(section(/relationships/i).getByText(/of free time/)).toHaveTextContent('115.5')
  })

  it('accepts decimals with a comma and Arabic digits', async () => {
    const user = renderAt('#/week/current')
    const sleep = section(/sleep/i)
    await user.type(sleep.getByRole('textbox', { name: /I sleep for around/ }), '7,5')
    expect(sleep.getByText(/hours per week sleeping/)).toHaveTextContent('52.5')

    const box = sleep.getByRole('textbox', { name: /I wind down for/ })
    await user.type(box, '٦٠')
    expect(sleep.getByText(/preparing to sleep/)).toHaveTextContent('7.0')
  })

  it('flags invalid text, keeps the last valid value and reverts on blur', async () => {
    const user = renderAt('#/week/current')
    const sleep = section(/sleep/i)
    const box = sleep.getByRole('textbox', { name: /I sleep for around/ })
    await user.type(box, '8')
    await user.type(box, 'x')

    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAccessibleDescription(/please enter a number/i)
    expect(sleep.getByText(/hours per week sleeping/)).toHaveTextContent('56.0')

    await user.tab()
    expect(box).toHaveValue('8')
    expect(box).not.toHaveAttribute('aria-invalid')
  })

  it('clamps work days to 7 and explains why', async () => {
    const user = renderAt('#/week/current')
    const work = section(/work/i)
    await user.type(work.getByRole('textbox', { name: /hours per day/ }), '8')
    await user.type(work.getByRole('textbox', { name: /days per week/ }), '9')
    expect(work.getByText(/officially working/)).toHaveTextContent('56.0')
    expect(work.getByText(/most you can enter here is 7/)).toBeInTheDocument()
  })

  it('warns in the remainder line when the week goes over 168 hours', async () => {
    const user = renderAt('#/week/current')
    await user.type(section(/sleep/i).getByRole('textbox', { name: /I sleep for around/ }), '24')
    await user.type(section(/fitness/i).getByRole('textbox', { name: /hours exercising/ }), '10')
    expect(section(/fitness/i).getByText(/more than a week has/)).toHaveTextContent('10.0')
  })

  it('lets childcare be skipped without losing what was entered', async () => {
    const user = renderAt('#/week/current')
    const childcare = section(/childcare/i)
    await user.type(childcare.getByRole('textbox', { name: /Each weekday/ }), '2')
    expect(childcare.getByText(/In total/)).toHaveTextContent('10.0')

    await user.click(childcare.getByRole('checkbox', { name: /not applicable/i }))
    expect(childcare.queryByRole('textbox')).not.toBeInTheDocument()
    expect(childcare.getByText(/In total/)).toHaveTextContent('0.0')

    await user.click(childcare.getByRole('checkbox', { name: /not applicable/i }))
    expect(childcare.getByRole('textbox', { name: /Each weekday/ })).toHaveValue('2')
  })

  it('keeps current and ideal weeks separate, with ideal wording', async () => {
    const user = renderAt('#/week/current')
    await user.type(section(/sleep/i).getByRole('textbox', { name: /I sleep for around/ }), '7')

    await user.click(screen.getByRole('link', { name: 'Ideal Week' }))
    expect(screen.getByRole('heading', { level: 1, name: /ideal week/i })).toBeInTheDocument()
    expect(
      section(/sleep/i).getByRole('textbox', { name: /I'd like to sleep for around/ }),
    ).toHaveValue('')
  })
})
