import { useCallback, useState } from 'react'
import { readItem, safeStorage, writeItem } from '../lib/storage'

/**
 * `useState` that remembers its value in localStorage (as JSON).
 * Stored values that fail `isValid` are ignored, and storage errors never break the app.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const text = readItem(safeStorage(), key)
    if (text === null) return fallback
    try {
      const parsed: unknown = JSON.parse(text)
      return isValid(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  })

  const update = useCallback(
    (next: T) => {
      setValue(next)
      writeItem(safeStorage(), key, JSON.stringify(next))
    },
    [key],
  )

  return [value, update]
}
