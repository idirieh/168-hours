import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  /** The button's label. */
  children: ReactNode
  /** Explains what will happen; shown with Yes / Cancel. */
  message: string
  confirmLabel: string
  onConfirm: () => void
  /** Ask first only when this is true (e.g. there's data to lose). */
  needsConfirm?: boolean
  className?: string
  danger?: boolean
}

/**
 * A button that asks "are you sure?" inline instead of in a browser dialog,
 * keeping focus where keyboard users expect it.
 */
export function ConfirmButton({
  children,
  message,
  confirmLabel,
  onConfirm,
  needsConfirm = true,
  className = '',
  danger = false,
}: Props) {
  const { t } = useTranslation()
  const [asking, setAsking] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasAsking = useRef(false)

  useEffect(() => {
    if (asking) cancelRef.current?.focus()
    else if (wasAsking.current) triggerRef.current?.focus()
    wasAsking.current = asking
  }, [asking])

  if (!asking) {
    return (
      <button
        ref={triggerRef}
        type="button"
        className={className}
        onClick={() => (needsConfirm ? setAsking(true) : onConfirm())}
      >
        {children}
      </button>
    )
  }

  const cancelOnEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setAsking(false)
  }

  return (
    <div
      role="group"
      aria-label={message}
      className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm shadow-sm"
    >
      <p className="w-full">{message}</p>
      <button
        type="button"
        onKeyDown={cancelOnEscape}
        onClick={() => {
          wasAsking.current = false
          setAsking(false)
          onConfirm()
        }}
        className={`rounded-lg px-3 py-1.5 font-semibold ${
          danger ? 'bg-danger text-white dark:text-bg' : 'bg-accent text-accent-fg'
        }`}
      >
        {confirmLabel}
      </button>
      <button
        ref={cancelRef}
        type="button"
        onKeyDown={cancelOnEscape}
        onClick={() => setAsking(false)}
        className="rounded-lg border border-border px-3 py-1.5 font-medium"
      >
        {t('common.cancel')}
      </button>
    </div>
  )
}
