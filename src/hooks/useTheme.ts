import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/** Also read by the inline script in index.html, which applies the theme before first paint. */
export const THEME_STORAGE_KEY = '168-hours:theme'

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme)

/**
 * The colour theme preference. "system" follows `prefers-color-scheme` (handled in CSS);
 * light and dark are forced with `data-theme` on <html>.
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, 'system', isTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.dataset.theme = theme
  }, [theme])

  return [theme, setTheme]
}
