const formatters = new Map<string, Intl.NumberFormat>()

/**
 * Format hours (or minutes) with one decimal place, like the spreadsheet's `0.0` format.
 * Uses Western digits in every language so numbers line up with what people type.
 */
export function formatNumber(value: number, locale: string): string {
  let fmt = formatters.get(locale)
  if (!fmt) {
    fmt = new Intl.NumberFormat(`${locale}-u-nu-latn`, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    formatters.set(locale, fmt)
  }
  // Avoid showing "-0.0" for tiny negative rounding noise.
  return fmt.format(Math.abs(value) < 0.05 ? 0 : value)
}

/** Value for an input box: empty for 0, otherwise the plain number. */
export function formatInputValue(value: number): string {
  return value === 0 ? '' : String(value)
}
