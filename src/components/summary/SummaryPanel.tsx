import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useWeekData } from '../../hooks/useWeekData'
import { AREA_EMOJI, AREA_IDS, FREE_EMOJI, USED_EMOJI } from '../../lib/areas'
import { HOURS_PER_WEEK, type Totals } from '../../lib/calc'
import { formatNumber } from '../../lib/format'
import type { WeekMode } from '../../state/weekState'
import { AREA_BG } from '../areaStyles'
import { ResultLine } from '../form/ResultLine'
import { DownloadPngButton } from './DownloadPngButton'
import { HoursBars } from './HoursBars'
import { TimeDonut } from './TimeDonut'

const PERIODS = [
  { key: 'weekly', emoji: '💭' },
  { key: 'monthly', emoji: '🗓️' },
  { key: 'annually', emoji: '🎊' },
] as const

/** The sheet's summary block: totals, area table and both charts, updated live. */
export function SummaryPanel({ mode }: { mode: WeekMode }) {
  const { t, i18n } = useTranslation()
  const { results } = useWeekData()
  const captureRef = useRef<HTMLDivElement>(null)
  const result = results[mode]
  const current = results.current
  const showVs = mode === 'ideal'
  const fmt = (value: number) => formatNumber(value, i18n.language)
  const signed = (value: number) => (value >= 0.05 ? `+${fmt(value)}` : fmt(value))
  const titleId = `${mode}-summary-title`

  const periods: Record<(typeof PERIODS)[number]['key'], Totals> = {
    weekly: result.weekly,
    monthly: result.monthly,
    annually: result.annual,
  }

  return (
    <aside id="summary" aria-labelledby={titleId} className="scroll-mt-24 space-y-3">
      <div
        ref={captureRef}
        className="space-y-6 rounded-[1.75rem] bg-surface p-5 shadow-[0_2px_24px_-12px_rgb(29_27_44/0.25)] ring-1 ring-border"
      >
        <h2 id={titleId} className="text-2xl font-bold">
          {t(`week.${mode}.heading`)} · {t('summary.title')}
        </h2>

        {result.isOverAllocated && (
          <div role="alert" className="rounded-xl bg-danger-soft p-4 text-danger">
            <p className="font-semibold">
              <span aria-hidden="true">⚠️ </span>
              {t('summary.overTitle')}
            </p>
            <p className="mt-1 text-sm">
              <ResultLine i18nKey="summary.overDetail" value={result.overBy} />
            </p>
          </div>
        )}

        <table className="w-full text-sm">
          <caption className="sr-only">{t('summary.totalsCaption')}</caption>
          <thead>
            <tr className="text-muted">
              <td />
              {PERIODS.map((p) => (
                <th key={p.key} scope="col" className="pb-1 text-end font-medium">
                  <span aria-hidden="true" className="block text-base">
                    {p.emoji}
                  </span>
                  {t(`summary.${p.key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['used', 'free'] as const).map((kind) => (
              <tr key={kind} className="border-t border-border">
                <th scope="row" className="py-2 text-start font-semibold">
                  <span aria-hidden="true">{kind === 'used' ? '⌛️ ' : '⏳ '}</span>
                  {t(kind === 'used' ? 'summary.hoursUsed' : 'summary.hoursFree')}
                </th>
                {PERIODS.map((p) => (
                  <td
                    key={p.key}
                    className={`py-2 text-end text-base font-bold tabular-nums ${
                      kind === 'free' && result.isOverAllocated ? 'text-danger' : ''
                    }`}
                  >
                    {fmt(periods[p.key][kind])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <figure>
          <figcaption className="mb-3 text-center text-sm font-semibold">
            {t('summary.pieTitle')}
          </figcaption>
          <TimeDonut result={result} />
        </figure>

        <table className="w-full text-sm">
          <caption className="sr-only">{t('summary.areaCaption')}</caption>
          <thead>
            <tr className="bg-accent text-accent-fg">
              <th scope="col" className="rounded-s-lg px-2 py-1.5 text-start font-semibold">
                {t('summary.lifeArea')}
              </th>
              <th scope="col" className="px-2 py-1.5 text-end font-semibold">
                {t('summary.hours')}
              </th>
              <th
                scope="col"
                className={`px-2 py-1.5 text-end font-semibold ${showVs ? '' : 'rounded-e-lg'}`}
              >
                <abbr title={t('summary.percentLabel')} className="no-underline">
                  {t('summary.percent')}
                </abbr>
              </th>
              {showVs && (
                <th scope="col" className="rounded-e-lg px-2 py-1.5 text-end font-semibold">
                  <abbr title={t('summary.vsCurrentLabel')} className="no-underline">
                    {t('summary.vsCurrent')}
                  </abbr>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {AREA_IDS.map((id) => (
              <tr key={id} className="border-b border-border/60">
                <th scope="row" className="px-2 py-1.5 text-start font-normal">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 shrink-0 rounded-full ${AREA_BG[id]}`}
                    />
                    <span aria-hidden="true">{AREA_EMOJI[id]}</span>
                    {t(`areas.${id}`)}
                  </span>
                </th>
                <td className="px-2 py-1.5 text-end">{fmt(result.areas[id])}</td>
                <td className="px-2 py-1.5 text-end text-muted">{fmt(result.percentOfWeek[id])}</td>
                {showVs && (
                  <td className="px-2 py-1.5 text-end text-muted">
                    {signed(result.areas[id] - current.areas[id])}
                  </td>
                )}
              </tr>
            ))}
            <tr className="border-b border-border/60 font-semibold">
              <th scope="row" className="px-2 py-1.5 text-start">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`size-2.5 shrink-0 rounded-full ${AREA_BG.free}`}
                  />
                  <span aria-hidden="true">{FREE_EMOJI}</span>
                  {t('areas.free')}
                </span>
              </th>
              <td className={`px-2 py-1.5 text-end ${result.isOverAllocated ? 'text-danger' : ''}`}>
                {fmt(result.freeTime)}
              </td>
              <td className="px-2 py-1.5 text-end text-muted">{fmt(result.percentOfWeek.free)}</td>
              {showVs && (
                <td className="px-2 py-1.5 text-end text-muted">
                  {signed(result.remaining - current.remaining)}
                </td>
              )}
            </tr>
            <tr className="font-semibold">
              <th scope="row" className="px-2 py-1.5 text-start">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 shrink-0" />
                  <span aria-hidden="true">{USED_EMOJI}</span>
                  {t('areas.used')}
                </span>
              </th>
              <td className="px-2 py-1.5 text-end">{fmt(result.hoursUsed)}</td>
              <td className="px-2 py-1.5 text-end text-muted">
                {fmt((result.hoursUsed / HOURS_PER_WEEK) * 100)}
              </td>
              {showVs && (
                <td className="px-2 py-1.5 text-end text-muted">
                  {signed(result.hoursUsed - current.hoursUsed)}
                </td>
              )}
            </tr>
          </tbody>
        </table>

        <figure>
          <figcaption className="mb-3 text-sm font-semibold">{t('summary.barTitle')}</figcaption>
          <HoursBars result={result} />
        </figure>

        <p className="text-center text-xs text-muted">
          {t('app.tagline')} · {t('app.name')}
        </p>
      </div>
      <DownloadPngButton target={captureRef} mode={mode} />
    </aside>
  )
}
