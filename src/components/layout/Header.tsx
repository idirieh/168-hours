import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'
import { THEMES, useTheme, type Theme } from '../../hooks/useTheme'
import { changeLanguage } from '../../i18n'
import { Underlined } from '../decor/Doodles'

const LINKS = [
  { to: '/week/current', key: 'nav.current' },
  { to: '/week/ideal', key: 'nav.ideal' },
  { to: '/compare', key: 'nav.compare' },
] as const

const THEME_EMOJI: Record<Theme, string> = { system: '🖥️', light: '☀️', dark: '🌙' }

export function Header() {
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useTheme()
  const other = i18n.language === 'ar' ? 'en' : 'ar'

  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md font-display text-2xl font-bold tracking-tight"
        >
          <img src="./favicon.svg" alt="" className="size-8" />
          <Underlined colour="sky">{t('app.name')}</Underlined>
        </Link>
        <nav
          aria-label={t('nav.label')}
          className="order-last w-full md:order-none md:ms-auto md:w-auto"
        >
          <ul className="flex gap-1">
            {LINKS.map((link) => (
              <li key={link.to} className="flex-1 md:flex-none">
                <NavLink
                  to={link.to}
                  className="block rounded-full px-4 py-2 text-center text-sm font-semibold whitespace-nowrap transition-colors hover:bg-cream aria-[current=page]:bg-accent aria-[current=page]:text-accent-fg aria-[current=page]:shadow-sm"
                >
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <button
            type="button"
            lang={other}
            onClick={() => void changeLanguage(other)}
            aria-label={t('settings.switchToLabel')}
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ring-border transition-colors hover:bg-cream"
          >
            {t('settings.switchTo')}
          </button>
          <label className="flex items-center rounded-full text-sm ring-1 ring-border">
            <span className="sr-only">{t('settings.theme')}</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="cursor-pointer rounded-full bg-transparent px-3 py-1.5 font-medium"
            >
              {THEMES.map((value) => (
                <option key={value} value={value} className="bg-surface text-fg">
                  {THEME_EMOJI[value]} {t(`settings.themes.${value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  )
}
