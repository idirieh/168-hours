import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router'
import { ConfirmButton } from '../components/ConfirmButton'
import { Underlined } from '../components/decor/Doodles'
import { Section } from '../components/form/Section'
import { MobileSummaryBar } from '../components/summary/MobileSummaryBar'
import { SummaryPanel } from '../components/summary/SummaryPanel'
import { useWeekData } from '../hooks/useWeekData'
import { AREA_IDS } from '../lib/areas'
import { WEEK_MODES, type WeekMode } from '../state/weekState'

function isWeekMode(value: string | undefined): value is WeekMode {
  return WEEK_MODES.includes(value as WeekMode)
}

export function WeekPage() {
  const { mode } = useParams()
  const { t } = useTranslation()
  if (!isWeekMode(mode)) return <Navigate to="/week/current" replace />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:pb-12">
      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <Underlined colour={mode === 'current' ? 'sun' : 'coral'}>
              {t(`week.${mode}.heading`)}
            </Underlined>
          </h1>
          <p className="mt-4 text-lg text-muted">{t(`week.${mode}.question`)}</p>
        </div>
        {mode === 'ideal' && <CopyFromCurrent />}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="space-y-8">
          {AREA_IDS.map((area) => (
            <Section key={`${mode}-${area}`} mode={mode} area={area} />
          ))}
        </div>
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-2">
          <SummaryPanel key={mode} mode={mode} />
        </div>
      </div>
      <MobileSummaryBar mode={mode} />
    </div>
  )
}

/** Starts the ideal week from a copy of the current one; asks first if that loses data. */
function CopyFromCurrent() {
  const { t } = useTranslation()
  const { state, dispatch } = useWeekData()
  const [copied, setCopied] = useState(false)
  const wouldLoseData =
    hasAnyValue(state.weeks.ideal) &&
    JSON.stringify(state.weeks.ideal) !== JSON.stringify(state.weeks.current)

  return (
    <div className="sm:ms-auto">
      <ConfirmButton
        message={t('week.ideal.copyConfirm')}
        confirmLabel={t('week.ideal.copyYes')}
        needsConfirm={wouldLoseData}
        onConfirm={() => {
          dispatch({ type: 'copyCurrentToIdeal' })
          setCopied(true)
        }}
        className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:border-accent-strong"
      >
        <span aria-hidden="true">📋 </span>
        {t('week.ideal.copy')}
      </ConfirmButton>
      <p role="status" className="mt-1 text-sm text-positive empty:hidden">
        {copied ? t('week.ideal.copied') : ''}
      </p>
    </div>
  )
}

function hasAnyValue(week: object): boolean {
  return Object.values(week).some((area: Record<string, number>) =>
    Object.values(area).some((v) => v !== 0),
  )
}
