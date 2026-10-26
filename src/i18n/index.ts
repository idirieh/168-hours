import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { readItem, safeStorage, writeItem } from '../lib/storage'
import ar from './locales/ar.json'
import en from './locales/en.json'

export const LANGUAGES = ['en', 'ar'] as const
export type Language = (typeof LANGUAGES)[number]

/** Also read by the inline script in index.html, which sets `lang`/`dir` before first paint. */
export const LANGUAGE_STORAGE_KEY = '168-hours:language'

const isLanguage = (value: unknown): value is Language => LANGUAGES.includes(value as Language)

/** The saved choice, else the browser's language if we support it, else English. */
function initialLanguage(): Language {
  const saved = readItem(safeStorage(), LANGUAGE_STORAGE_KEY)
  if (isLanguage(saved)) return saved
  const browser = typeof navigator === 'undefined' ? '' : navigator.language.slice(0, 2)
  return isLanguage(browser) ? browser : 'en'
}

/** Keep <html lang dir> in step with the language, so RTL layout and fonts follow. */
function applyToDocument(lng: string) {
  const root = document.documentElement
  root.lang = lng
  root.dir = i18n.dir(lng)
}

i18n.on('languageChanged', applyToDocument)

/** Switch language and remember the choice (only an explicit choice is saved). */
export function changeLanguage(lng: Language) {
  writeItem(safeStorage(), LANGUAGE_STORAGE_KEY, lng)
  return i18n.changeLanguage(lng)
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  supportedLngs: LANGUAGES,
  interpolation: { escapeValue: false }, // React already escapes output.
  returnNull: false,
})

export default i18n
