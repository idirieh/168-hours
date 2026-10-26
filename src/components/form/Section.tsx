import { useTranslation } from 'react-i18next'
import { useWeekData } from '../../hooks/useWeekData'
import { AREA_EMOJI, AREA_IDS, FREE_EMOJI, type AreaId } from '../../lib/areas'
import { SECTIONS, type RowConfig } from '../../sections.config'
import type { WeekMode } from '../../state/weekState'
import { AREA_BG } from '../areaStyles'
import { ResultLine } from './ResultLine'
import { SentenceRow } from './SentenceRow'

interface Props {
  mode: WeekMode
  area: AreaId
}

const LAST_AREA = AREA_IDS[AREA_IDS.length - 1]

/** One life-area section: header, sentence rows, total and running remainder. */
export function Section({ mode, area }: Props) {
  const { t, i18n } = useTranslation()
  const { state, dispatch, results } = useWeekData()
  /** Text for this week mode: `<key>_ideal` when it exists, else `<key>`. */
  const forMode = (key: string) => (i18n.exists(`${key}_${mode}`) ? t(`${key}_${mode}`) : t(key))
  const config = SECTIONS[area]
  const result = results[mode]
  const inputs = state.weeks[mode][area] as unknown as Record<string, number>
  const breakdown = result.breakdown[area] as unknown as Record<string, number>
  const skipped = config.optional === true && state.childcareSkipped[mode]
  const titleId = `${mode}-${area}-title`
  const remaining = result.remainingAfter[area]

  const rows = config.rows as RowConfig<AreaId>[]

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_2px_24px_-12px_rgb(29_27_44/0.25)] ring-1 ring-border"
    >
      <header
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4 text-ink ${AREA_BG[area]}`}
      >
        <h2 id={titleId} className="flex items-center gap-3 text-2xl font-bold">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 -rotate-6 place-items-center rounded-2xl bg-white/85 text-xl shadow-sm"
          >
            {AREA_EMOJI[area]}
          </span>
          {t(`areas.${area}`)}
        </h2>
        {config.optional && (
          <label className="ms-auto flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={skipped}
              onChange={(e) =>
                dispatch({ type: 'setChildcareSkipped', mode, skipped: e.target.checked })
              }
              className="size-4 accent-ink"
            />
            {t('form.skip')}
          </label>
        )}
      </header>

      {skipped ? (
        <p className="px-5 py-4 text-muted">{t('form.skipped')}</p>
      ) : (
        <div className="divide-y divide-border/60 py-1">
          {rows.map((row) => (
            <SentenceRow
              key={row.field}
              before={forMode(`sections.${area}.rows.${row.field}.before`)}
              after={forMode(`sections.${area}.rows.${row.field}.after`)}
              value={inputs[row.field] ?? 0}
              max={row.max}
              onChange={(value) =>
                dispatch({ type: 'setField', mode, area, field: row.field, value })
              }
            >
              {row.results?.map((key) => (
                <p key={key}>
                  <span
                    aria-hidden="true"
                    className="me-1.5 text-accent-strong rtl:inline-block rtl:-scale-x-100"
                  >
                    →
                  </span>
                  <ResultLine
                    i18nKey={`sections.${area}.results.${key}`}
                    value={breakdown[key] ?? 0}
                  />
                </p>
              ))}
            </SentenceRow>
          ))}
        </div>
      )}

      <footer className="space-y-1 bg-cream px-5 py-4">
        <p>
          <span aria-hidden="true" className="me-1.5">
            {AREA_EMOJI[area]}
          </span>
          <ResultLine i18nKey={`sections.${area}.total`} value={result.areas[area]} />
        </p>
        <p className={`font-medium ${remaining < 0 ? 'text-danger' : ''}`}>
          <span aria-hidden="true" className="me-1.5">
            {remaining < 0 ? '⚠️' : FREE_EMOJI}
          </span>
          {remaining < 0 ? (
            <ResultLine i18nKey="form.remainingOver" value={-remaining} />
          ) : (
            <ResultLine
              i18nKey={area === LAST_AREA ? 'form.remainingFree' : 'form.remaining'}
              value={remaining}
            />
          )}
        </p>
      </footer>
    </section>
  )
}
