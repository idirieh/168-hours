import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AREA_BG, AREA_COLOR } from '../components/areaStyles'
import { Circled, LoopArrow, Underlined } from '../components/decor/Doodles'
import { AREA_EMOJI, AREA_IDS, FREE_EMOJI } from '../lib/areas'
import { ALI_URL, BOOK_URL } from '../lib/links'

const STEPS = [
  { key: 'current', emoji: '👉', to: '/week/current', banner: 'bg-coral', body: 'bg-cream' },
  { key: 'ideal', emoji: '🌈', to: '/week/ideal', banner: 'bg-sky', body: 'bg-tangerine' },
  { key: 'compare', emoji: '⚖️', to: '/compare', banner: 'bg-mint', body: 'bg-cream' },
] as const

const LINK = 'font-semibold text-accent-strong underline decoration-2 underline-offset-4'

export function LandingPage() {
  const { t } = useTranslation()
  return (
    <div className="px-4 pt-4 pb-16 sm:px-6 sm:pt-6">
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[2.5rem] bg-cream px-6 py-12 sm:px-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:py-20">
        <HeroArt />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 text-sm font-semibold shadow-sm">
            <span aria-hidden="true">✨</span>
            {t('app.tagline')}
          </p>
          <h1 className="mt-6 text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            <Trans i18nKey="landing.title" components={{ u: <Underlined colour="sky" /> }} />
          </h1>
          <div className="mt-8 max-w-xl space-y-4 text-lg text-fg/85 sm:text-xl">
            <p>{t('landing.intro')}</p>
            <p>{t('landing.intro2')}</p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/week/current"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-fg shadow-[0_8px_24px_-8px_rgb(255_120_60/0.7)] transition-transform hover:-translate-y-0.5"
            >
              {t('landing.start')}
              <span aria-hidden="true" className="rtl:-scale-x-100">
                →
              </span>
            </Link>
          </div>
          <p className="mt-8 max-w-lg text-muted">
            <Trans
              i18nKey="landing.credit"
              components={{
                // eslint-disable-next-line jsx-a11y/anchor-has-content -- text comes from Trans
                a: <a href={BOOK_URL} target="_blank" rel="noreferrer" className={LINK} />,
                // eslint-disable-next-line jsx-a11y/anchor-has-content -- text comes from Trans
                ali: <a href={ALI_URL} target="_blank" rel="noreferrer" className={LINK} />,
                i: <cite className="italic" />,
              }}
            />
          </p>
        </div>
        <LoopArrow className="absolute end-5 bottom-4 hidden h-20 lg:block rtl:-scale-x-100" />
      </section>

      <section className="mx-auto mt-24 max-w-6xl">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <Trans i18nKey="landing.areasTitle" components={{ u: <Underlined colour="sun" /> }} />
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-muted">{t('landing.areasText')}</p>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...AREA_IDS, 'free' as const].map((id) => (
            <li
              key={id}
              className={`flex items-center gap-3 rounded-3xl p-4 text-ink transition-transform hover:-rotate-1 ${AREA_BG[id]}`}
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/80 text-2xl"
              >
                {id === 'free' ? FREE_EMOJI : AREA_EMOJI[id]}
              </span>
              <span className="font-semibold">{t(`areas.${id}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-28 max-w-6xl">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <Trans i18nKey="landing.steps.title" components={{ c: <Circled colour="sky" /> }} />
        </h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.key} className={index === 1 ? 'md:-translate-y-4' : ''}>
              <Link
                to={step.to}
                className={`group flex h-full flex-col overflow-hidden rounded-[2rem] shadow-sm transition-transform hover:-translate-y-1 ${step.body} ${index === 1 ? 'text-ink shadow-xl ring-4 ring-tangerine' : ''}`}
              >
                <span className={`relative flex h-40 items-center justify-center ${step.banner}`}>
                  <span
                    aria-hidden="true"
                    className="absolute start-6 top-3 font-display text-7xl font-bold text-white/60"
                  >
                    {index + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-20 rotate-[-6deg] place-items-center rounded-3xl bg-white text-4xl shadow-md transition-transform group-hover:rotate-3"
                  >
                    {step.emoji}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-7">
                  <span className="sr-only">{index + 1}. </span>
                  <span className="font-display text-2xl font-bold">
                    {t(`landing.steps.${step.key}.title`)}
                  </span>
                  <span className={`mt-3 block ${index === 1 ? '' : 'text-muted'}`}>
                    {t(`landing.steps.${step.key}.text`)}
                  </span>
                  <span className="mt-auto pt-6 font-semibold">
                    <span className="underline decoration-2 underline-offset-4">
                      {t('landing.steps.go')}
                    </span>{' '}
                    <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                      →
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="mx-auto mt-20 max-w-6xl rounded-[2rem] bg-sky px-8 py-6 text-lg font-medium text-ink">
        {t('landing.privacy')}
      </p>
    </div>
  )
}

/** A sample week as a colourful donut, sitting in a sunny speech bubble. */
function HeroArt() {
  const sample = {
    sleep: 56,
    work: 45,
    food: 10,
    chores: 8,
    childcare: 7,
    fitness: 5,
    entertainment: 14,
    relationships: 10,
    free: 13,
  }
  const radius = 62
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const arcs = (Object.keys(sample) as (keyof typeof sample)[]).map((id) => {
    const length = (sample[id] / 168) * circumference
    const arc = { id, length, offset }
    offset += length
    return arc
  })

  return (
    <div
      aria-hidden="true"
      className="relative order-last mx-auto w-full max-w-xs sm:max-w-sm lg:order-first lg:max-w-md"
    >
      <svg viewBox="0 0 400 400" className="w-full">
        <path
          d="M60 300 A 170 170 0 0 1 90 80"
          fill="none"
          stroke="#ffd166"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path d="M96 62 L 106 50" stroke="#ffd166" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M300 360 A 170 170 0 0 0 360 300"
          fill="none"
          className="stroke-border"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M200 40 A 160 160 0 1 1 90 316 L 40 340 L 72 290 A 160 160 0 0 1 200 40 Z"
          fill="#ffd166"
        />
        <g transform="translate(200 200) rotate(-90)">
          <circle r={radius + 34} fill="#ffffff" />
          {arcs.map((arc) => (
            <circle
              key={arc.id}
              r={radius}
              fill="none"
              stroke={AREA_COLOR[arc.id]}
              strokeWidth="40"
              strokeDasharray={`${Math.max(arc.length - 3, 0)} ${circumference}`}
              strokeDashoffset={-arc.offset}
            />
          ))}
        </g>
        <text
          x="200"
          y="210"
          textAnchor="middle"
          className="fill-ink font-display"
          fontSize="44"
          fontWeight="700"
        >
          168
        </text>
      </svg>
      <span className="absolute end-4 top-6 rotate-12 text-6xl drop-shadow-sm">👋</span>
      <span className="absolute start-0 bottom-10 -rotate-12 rounded-2xl bg-surface px-3 py-2 text-3xl shadow-md">
        ⏳
      </span>
    </div>
  )
}
