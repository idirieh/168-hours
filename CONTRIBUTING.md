# Contributing to 168 Hours

Thanks for helping! Bug reports, translations, accessibility fixes and ideas are all welcome.

## Before you start

- For anything bigger than a small fix, please open an issue first so we can agree on the
  approach.
- Be kind and constructive. Assume good intent.

## Local setup

```bash
npm install
npm run dev
```

Before opening a pull request, run the same checks as CI:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

## Guidelines

- **Maths stays pure.** Formulas belong in `src/lib/calc.ts` with no React, and every change
  needs a test in `calc.test.ts`. If a change affects spreadsheet parity, explain why in the
  pull request.
- **No hard-coded text.** Every visible string goes in `src/i18n/locales/en.json` _and_
  `ar.json`. `locales.test.ts` fails if keys or `{{placeholders}}` don't match.
- **Form changes go through `sections.config.ts`**, not new markup.
- **Privacy is a feature.** No analytics, trackers, external requests or backends. Data must
  stay in the browser.
- **Accessibility:** label every input, keep keyboard access working, keep WCAG AA contrast in
  light and dark mode, and use logical CSS (`ms-`, `pe-`, `start`) so RTL keeps working.
- Keep pull requests focused, and describe what changed and how you tested it.

## Adding a language

1. Copy `src/i18n/locales/en.json` to `<code>.json` and translate the values (keep the keys,
   `{{placeholders}}` and `<b>` tags).
2. Register it in `src/i18n/index.ts` (`LANGUAGES` and `resources`) and add it to the
   locale test.
3. Add a way to switch to it in `Header.tsx`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
