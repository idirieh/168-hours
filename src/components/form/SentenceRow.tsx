import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { formatInputValue } from '../../lib/format'
import { clamp, parseNumberInput } from '../../lib/parse'

interface Props {
  before: string
  after: string
  value: number
  max?: number | undefined
  onChange: (value: number) => void
  /** Computed lines shown under the sentence. */
  children?: ReactNode
}

type Hint = 'invalid' | 'clamped' | null

/**
 * One fill-in-the-sentence row: "I sleep for around [ 7 ] hours per night."
 *
 * The box keeps whatever the person is typing (so "7." or an empty box don't
 * jump around) and only reports values that parse; invalid text is reverted on blur.
 */
export function SentenceRow({ before, after, value, max, onChange, children }: Props) {
  const { t } = useTranslation()
  const hintId = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const [hint, setHint] = useState<Hint>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setDraft(text)
    const parsed = parseNumberInput(text)
    if (parsed === null) {
      setHint('invalid')
      return
    }
    const next = max === undefined ? parsed : clamp(parsed, 0, max)
    setHint(next === parsed ? null : 'clamped')
    onChange(next)
  }

  function handleBlur() {
    setDraft(null)
    if (hint === 'invalid') setHint(null)
  }

  return (
    <div className="px-5 py-3">
      <label className="block leading-9">
        {before}{' '}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={draft ?? formatInputValue(value)}
          onChange={handleChange}
          onFocus={() => setDraft(formatInputValue(value))}
          onBlur={handleBlur}
          aria-invalid={hint === 'invalid' || undefined}
          aria-describedby={hint ? hintId : undefined}
          className="mx-0.5 inline-block w-20 rounded-lg border border-cell-border bg-cell px-2 py-1 text-center text-lg leading-tight font-semibold tabular-nums transition-colors placeholder:text-muted/60 hover:border-accent-strong focus-visible:border-accent-strong aria-invalid:border-danger"
        />{' '}
        {after}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-danger">
          {hint === 'invalid' ? t('form.invalid') : t('form.clamped', { max })}
        </p>
      )}
      {children && (
        <div aria-live="polite" className="mt-1 space-y-0.5 text-muted">
          {children}
        </div>
      )}
    </div>
  )
}
