import { useTranslation } from 'react-i18next'
import { AREA_EMOJI, AREA_IDS, FREE_EMOJI } from '../../lib/areas'
import type { WeekResult } from '../../lib/calc'
import { formatNumber } from '../../lib/format'
import { AREA_COLOR } from '../areaStyles'

/**
 * The sheet's "overall" bar chart: hours per area, longest bar = biggest area.
 * Plain HTML bars so labels stay crisp, wrap in Arabic and flip with RTL.
 * Decorative for screen readers (the table has the numbers).
 */
export function HoursBars({ result }: { result: WeekResult }) {
  const { t, i18n } = useTranslation()
  const rows = [
    ...AREA_IDS.map((id) => ({
      id,
      label: `${AREA_EMOJI[id]} ${t(`areas.${id}`)}`,
      value: result.areas[id],
    })),
    { id: 'free' as const, label: `${FREE_EMOJI} ${t('areas.free')}`, value: result.freeTime },
  ]
  const max = Math.max(1, ...rows.map((r) => r.value))

  return (
    <ul className="space-y-1.5 text-sm" aria-hidden="true">
      {rows.map((row) => (
        <li key={row.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2">
          <span className="truncate text-muted">{row.label}</span>
          <span className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <span
                className="block h-3 rounded-full transition-[width] duration-300"
                style={{
                  width: `${(row.value / max) * 100}%`,
                  minWidth: row.value > 0 ? '0.25rem' : 0,
                  backgroundColor: AREA_COLOR[row.id],
                }}
              />
            </span>
            <span className="w-12 shrink-0 text-end font-medium tabular-nums">
              {formatNumber(row.value, i18n.language)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
