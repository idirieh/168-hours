import { useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { dateStamp, downloadUrl } from '../../lib/download'
import type { WeekMode } from '../../state/weekState'

type Status = 'idle' | 'busy' | 'failed'

/** Saves the summary card as a PNG, rendered entirely in the browser. */
export function DownloadPngButton({
  target,
  mode,
}: {
  target: RefObject<HTMLElement | null>
  mode: WeekMode
}) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<Status>('idle')

  async function handleClick() {
    const node = target.current
    if (!node) return
    setStatus('busy')
    try {
      // Loaded on demand so the main bundle stays small.
      const { toPng } = await import('html-to-image')
      const url = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      })
      downloadUrl(url, `168-hours-${mode}-week-${dateStamp()}.png`)
      setStatus('idle')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={status === 'busy'}
        className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-accent-strong disabled:opacity-60"
      >
        <span aria-hidden="true">🖼️ </span>
        {status === 'busy' ? t('summary.preparing') : t('summary.downloadPng')}
      </button>
      <p role="status" className="mt-1 text-center text-sm text-danger empty:hidden">
        {status === 'failed' ? t('summary.pngFailed') : ''}
      </p>
    </div>
  )
}
