import { Trans, useTranslation } from 'react-i18next'
import { formatNumber } from '../../lib/format'

interface Props {
  /** Translation key whose text contains `<b>{{value}}</b>`. */
  i18nKey: string
  value: number
}

/** A sentence with one highlighted, locale-formatted number in it. */
export function ResultLine({ i18nKey, value }: Props) {
  const { i18n } = useTranslation()
  return (
    <Trans
      i18nKey={i18nKey}
      values={{ value: formatNumber(value, i18n.language) }}
      components={{ b: <strong className="font-semibold text-fg tabular-nums" /> }}
    />
  )
}
