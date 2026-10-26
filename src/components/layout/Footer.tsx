import { Trans, useTranslation } from 'react-i18next'
import { ALI_URL, BOOK_URL } from '../../lib/links'
import { DataTools } from './DataTools'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-12 rounded-t-[2.5rem] bg-cream pb-20 lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 text-sm text-muted sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <DataTools />
        <div className="space-y-2">
          <p>
            <span aria-hidden="true">🔒 </span>
            {t('footer.privacy')}
          </p>
          <p>
            <Trans
              i18nKey="footer.credit"
              components={{
                a: (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content -- text comes from Trans
                  <a
                    href={BOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-accent-strong underline underline-offset-2"
                  />
                ),
                ali: (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content -- text comes from Trans
                  <a
                    href={ALI_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-accent-strong underline underline-offset-2"
                  />
                ),
              }}
            />
          </p>
        </div>
      </div>
    </footer>
  )
}
