import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useWeekData } from '../hooks/useWeekData'
import { AREA_EMOJI, AREA_IDS, FREE_EMOJI, USED_EMOJI } from '../lib/areas'
import { compareWeeks, type CompareKey } from '../lib/calc'
import { formatNumber } from '../lib/format'
import { pickInsight } from '../lib/insight'
import { AREA_BG, AREA_COLOR } from '../components/areaStyles'
import { Underlined } from '../components/decor/Doodles'

const ROWS: (CompareKey & keyof typeof AREA_BG)[] = [...AREA_IDS, 'free']

export function ComparePage() {
  const { t, i18n } = useTranslation()
  const { results } = useWeekData()
  const { current, ideal } = results
  const diff = compareWeeks(current, ideal)
  const fmt = (value: number) => formatNumber(value, i18n.language)
  const signed = (value: number) => (value >= 0.05 ? `+${fmt(value)}` : fmt(value))
  const isEmpty = current.hoursUsed === 0 && ideal.hoursUsed === 0
  const maxAbs = Math.max(1, ...ROWS.map((k) => Math.abs(diff[k])))

  const label = (key: CompareKey) =>
    key === 'free'
      ? `${FREE_EMOJI} ${t('areas.free')}`
      : key === 'used'
        ? `${USED_EMOJI} ${t('areas.used')}`
        : `${AREA_EMOJI[key]} ${t(`areas.${key}`)}`
  const hoursOf = (key: CompareKey, week: typeof current) =>
    key === 'free' ? week.remaining : key === 'used' ? week.hoursUsed : week.areas[key]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        <Underlined colour="mint">{t('compare.heading')}</Underlined>
      </h1>
      <p className="mt-4 text-lg text-muted">{t('compare.question')}</p>

      {isEmpty ? (
        <p className="mt-8 rounded-[1.75rem] bg-cream p-6 text-lg">
          <Trans
            i18nKey="compare.empty"
            components={{
              current: (
                <Link to="/week/current" className="font-semibold text-accent-strong underline" />
              ),
              ideal: (
                <Link to="/week/ideal" className="font-semibold text-accent-strong underline" />
              ),
            }}
          />
        </p>
      ) : (
        <>
          <Insight diff={diff} />

          <div className="mt-8 overflow-x-auto rounded-[1.75rem] bg-surface shadow-[0_2px_24px_-12px_rgb(29_27_44/0.25)] ring-1 ring-border">
            <table className="w-full text-sm sm:text-base">
              <caption className="sr-only">{t('compare.caption')}</caption>
              <thead className="bg-accent text-accent-fg">
                <tr>
                  <th scope="col" className="px-4 py-2 text-start">
                    {t('summary.lifeArea')}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end">
                    {t('compare.current')}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end">
                    {t('compare.ideal')}
                  </th>
                  <th scope="col" className="px-4 py-2 text-end">
                    {t('compare.difference')}
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[...ROWS, 'used' as const].map((key) => (
                  <tr
                    key={key}
                    className={`border-t border-border/60 ${key === 'free' || key === 'used' ? 'font-semibold' : ''}`}
                  >
                    <th scope="row" className="px-4 py-2 text-start font-[inherit]">
                      {label(key)}
                    </th>
                    <td className="px-4 py-2 text-end">{fmt(hoursOf(key, current))}</td>
                    <td className="px-4 py-2 text-end">{fmt(hoursOf(key, ideal))}</td>
                    <td
                      className={`px-4 py-2 text-end font-semibold ${
                        diff[key] >= 0.05
                          ? 'text-positive'
                          : diff[key] <= -0.05
                            ? 'text-danger'
                            : 'text-muted'
                      }`}
                    >
                      {signed(diff[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <figure className="mt-8 rounded-[1.75rem] bg-surface p-5 shadow-[0_2px_24px_-12px_rgb(29_27_44/0.25)] ring-1 ring-border">
            <figcaption>
              <span className="font-display text-xl font-bold">{t('compare.chartTitle')}</span>
              <span className="mt-1 block text-sm text-muted">{t('compare.chartHint')}</span>
            </figcaption>
            <ul className="mt-4 space-y-2 text-sm">
              {ROWS.map((key) => {
                const d = diff[key]
                const width = `${(Math.abs(d) / maxAbs) * 100}%`
                const bar = (
                  <span
                    className="block h-4 rounded-full"
                    style={{ width, backgroundColor: AREA_COLOR[key] }}
                  />
                )
                const description =
                  d >= 0.05
                    ? t('compare.more', { value: fmt(d) })
                    : d <= -0.05
                      ? t('compare.less', { value: fmt(-d) })
                      : t('compare.noChange')
                return (
                  <li
                    key={key}
                    className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]"
                  >
                    <span className="truncate">
                      {label(key)}
                      <span className="sr-only">: {description}</span>
                    </span>
                    <span aria-hidden="true" className="flex items-center">
                      <span className="flex flex-1 justify-end border-e border-fg/40 pe-px">
                        {d < 0 && bar}
                      </span>
                      <span className="flex flex-1 ps-px">{d > 0 && bar}</span>
                      <span className="w-14 shrink-0 text-end text-muted tabular-nums">
                        {signed(d)}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </figure>
        </>
      )}
    </div>
  )
}

function Insight({ diff }: { diff: ReturnType<typeof compareWeeks> }) {
  const { t, i18n } = useTranslation()
  const { gain, loss } = pickInsight(diff)
  const key = gain && loss ? 'both' : gain ? 'gainOnly' : loss ? 'lossOnly' : 'same'
  const values = {
    gain: gain ? formatNumber(gain.hours, i18n.language) : '',
    gainArea: gain ? t(`compare.areaNames.${gain.area}`) : '',
    loss: loss ? formatNumber(loss.hours, i18n.language) : '',
    lossArea: loss ? t(`compare.areaNames.${loss.area}`) : '',
  }
  return (
    <p className="mt-8 rounded-[1.75rem] bg-sun px-6 py-5 text-lg text-ink">
      <span aria-hidden="true">💡 </span>
      <Trans
        i18nKey={`compare.insight.${key}`}
        values={values}
        components={{ b: <strong className="font-bold tabular-nums" /> }}
      />
    </p>
  )
}
