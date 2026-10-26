/**
 * Parsing for the free-text numeric inputs.
 *
 * Accepts what people actually type: an empty field (0), decimals with `.` or `,`,
 * and Arabic-Indic / Persian digits with the Arabic decimal separator `٫`.
 */

const ARABIC_INDIC_ZERO = 0x0660
const PERSIAN_ZERO = 0x06f0

function normaliseDigits(raw: string): string {
  return raw.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0)
    const zero = code >= PERSIAN_ZERO ? PERSIAN_ZERO : ARABIC_INDIC_ZERO
    return String(code - zero)
  })
}

/**
 * Parse a user-typed number. Returns `0` for empty input and `null` when the text
 * isn't a valid non-negative number (e.g. "abc", "-3", "1.2.3").
 */
export function parseNumberInput(raw: string): number | null {
  const text = normaliseDigits(raw.trim()).replace(/[٫,]/g, '.')
  if (text === '') return 0
  if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
