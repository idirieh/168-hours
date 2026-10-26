import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart } from 'recharts'
import { AREA_IDS, type AreaId } from '../../lib/areas'
import type { WeekResult } from '../../lib/calc'
import { formatNumber } from '../../lib/format'
import { AREA_COLOR } from '../areaStyles'

const SIZE = 200

/**
 * Donut of the eight areas plus free time, with free hours in the middle.
 * Decorative for screen readers: the table next to it has the same numbers.
 */
export function TimeDonut({ result }: { result: WeekResult }) {
  const { t, i18n } = useTranslation()
  const slices: { id: AreaId | 'free'; value: number }[] = [
    ...AREA_IDS.map((id) => ({ id, value: result.areas[id] })),
    { id: 'free' as const, value: result.freeTime },
  ].filter((s) => s.value > 0)

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }} aria-hidden="true">
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="id"
          innerRadius={62}
          outerRadius={96}
          paddingAngle={slices.length > 1 ? 1 : 0}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={false}
        >
          {slices.map((s) => (
            <Cell key={s.id} fill={AREA_COLOR[s.id]} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-3xl font-bold tabular-nums ${result.isOverAllocated ? 'text-danger' : ''}`}
        >
          {formatNumber(result.freeTime, i18n.language)}
        </span>
        <span className="text-sm text-muted">{t('summary.freeCenter')}</span>
      </div>
    </div>
  )
}
