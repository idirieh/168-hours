import { useTranslation } from 'react-i18next'
import { useWeekData } from '../../hooks/useWeekData'
import { FREE_EMOJI } from '../../lib/areas'
import { formatNumber } from '../../lib/format'
import type { WeekMode } from '../../state/weekState'

/**
 * Small screens show the summary below the form, so this bar keeps the key numbers
 * in view while typing and jumps to the full summary.
 */
export function MobileSummaryBar({ mode }: { mode: WeekMode }) {
  const { t, i18n } = useTranslation()
  const result = useWeekData().results[mode]
  const fmt = (value: number) => formatNumber(value, i18n.language)

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 py-2 shadow-[0_-4px_16px_rgb(0_0_0/0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 text-sm whitespace-nowrap">
        <p className={result.isOverAllocated ? 'font-semibold text-danger' : ''}>
          <span aria-hidden="true">{result.isOverAllocated ? '⚠️' : FREE_EMOJI} </span>
          {t('summary.hoursFree')}:{' '}
          <strong className="text-base tabular-nums">{fmt(result.freeTime)}</strong>
        </p>
        <p className="hidden text-muted min-[420px]:block">
          {t('summary.hoursUsed')}: <span className="tabular-nums">{fmt(result.hoursUsed)}</span>
        </p>
        <button
          type="button"
          onClick={() => document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth' })}
          className="ms-auto rounded-full bg-accent px-4 py-1.5 font-semibold text-accent-fg"
        >
          {t('summary.jump')}
        </button>
      </div>
    </div>
  )
}
