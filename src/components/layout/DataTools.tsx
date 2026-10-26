import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useWeekData } from '../../hooks/useWeekData'
import { dateStamp, downloadText } from '../../lib/download'
import { parseExport, toSavedData } from '../../lib/storage'
import { ConfirmButton } from '../ConfirmButton'

type Message = 'imported' | 'importFailed' | 'resetDone' | null

const BUTTON =
  'rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-accent-strong'

/** Export / import a JSON backup, and reset everything. All local, nothing is uploaded. */
export function DataTools() {
  const { t } = useTranslation()
  const { state, dispatch } = useWeekData()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<Message>(null)

  function handleExport() {
    const json = JSON.stringify(toSavedData(state), null, 2)
    downloadText(json, `168-hours-${dateStamp()}.json`)
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // Let the same file be picked again later.
    if (!file) return
    const imported = parseExport(await file.text())
    if (imported) dispatch({ type: 'replace', state: imported })
    setMessage(imported ? 'imported' : 'importFailed')
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-fg">{t('data.title')}</h2>
      <p className="mt-1">{t('data.intro')}</p>
      <div className="mt-3 flex flex-wrap items-start gap-2">
        <button type="button" onClick={handleExport} className={BUTTON}>
          <span aria-hidden="true">⬇️ </span>
          {t('data.export')}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={BUTTON}>
          <span aria-hidden="true">⬆️ </span>
          {t('data.import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label={t('data.import')}
          onChange={(e) => void handleImport(e)}
        />
        <ConfirmButton
          danger
          message={t('data.resetConfirm')}
          confirmLabel={t('data.resetYes')}
          onConfirm={() => {
            dispatch({ type: 'reset' })
            setMessage('resetDone')
          }}
          className={`${BUTTON} text-danger`}
        >
          <span aria-hidden="true">🗑️ </span>
          {t('data.reset')}
        </ConfirmButton>
      </div>
      <p
        role="status"
        className={`mt-2 empty:hidden ${message === 'importFailed' ? 'text-danger' : 'text-positive'}`}
      >
        {message ? t(`data.${message}`) : ''}
      </p>
    </div>
  )
}
