import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import i18n from '../i18n'

// Node 25+ ships its own (file-backed) `localStorage` global, which shadows jsdom's
// and is unusable without `--localstorage-file`. Use a simple in-memory Storage so
// tests behave the same on every Node version.
class MemoryStorage implements Storage {
  #items = new Map<string, string>()
  get length() {
    return this.#items.size
  }
  clear() {
    this.#items.clear()
  }
  getItem(key: string) {
    return this.#items.get(key) ?? null
  }
  key(index: number) {
    return [...this.#items.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.#items.delete(key)
  }
  setItem(key: string, value: string) {
    this.#items.set(key, String(value))
  }
}
Object.defineProperty(window, 'localStorage', { value: new MemoryStorage(), configurable: true })

// jsdom doesn't implement these; the app only uses them for nicer scrolling.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

afterEach(async () => {
  cleanup()
  window.location.hash = ''
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  if (i18n.language !== 'en') await i18n.changeLanguage('en')
})
