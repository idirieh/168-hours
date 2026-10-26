import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { ComparePage } from './pages/ComparePage'
import { LandingPage } from './pages/LandingPage'
import { WeekPage } from './pages/WeekPage'
import { WeekDataProvider } from './state/WeekDataContext'
import type { WeekState } from './state/weekState'

interface Props {
  initialState?: WeekState
}

export function App({ initialState }: Props) {
  const { t } = useTranslation()
  return (
    <WeekDataProvider {...(initialState && { initialState })}>
      <HashRouter>
        <ScrollToTop />
        <a
          href="#main"
          className="sr-only rounded-lg bg-surface px-4 py-2 focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
          onClick={(e) => {
            // Hash links would clash with the hash router, so move focus manually.
            e.preventDefault()
            document.getElementById('main')?.focus()
          }}
        >
          {t('app.skipToContent')}
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/week/:mode" element={<WeekPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </WeekDataProvider>
  )
}

/** Start each page at the top, like a normal site. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo?.(0, 0)
  }, [pathname])
  return null
}
