import type { ReactNode } from 'react'

type Colour = 'sky' | 'sun' | 'coral' | 'tangerine' | 'mint'

const STROKE: Record<Colour, string> = {
  sky: 'text-sky',
  sun: 'text-sun',
  coral: 'text-coral',
  tangerine: 'text-tangerine',
  mint: 'text-mint',
}

/** Words with a hand-drawn swoosh underneath, like a marker underline. */
export function Underlined({
  children,
  colour = 'sky',
}: {
  children?: ReactNode
  colour?: Colour
}) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        className={`absolute inset-x-0 -bottom-[0.18em] h-[0.3em] w-full ${STROKE[colour]}`}
      >
        <path
          d="M3 11 C 50 4, 120 3, 197 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M30 14 C 80 9, 140 9, 182 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

/** Words with a loose hand-drawn loop around them. */
export function Circled({ children, colour = 'sky' }: { children?: ReactNode; colour?: Colour }) {
  return (
    <span className="relative inline-block px-[0.12em]">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute -inset-x-[0.2em] -inset-y-[0.25em] h-[calc(100%+0.5em)] w-[calc(100%+0.4em)] ${STROKE[colour]}`}
      >
        <path
          d="M150 8 C 70 0, 8 20, 6 52 C 4 84, 80 96, 140 90 C 190 84, 198 50, 186 30 C 176 14, 140 6, 110 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  )
}

/** A loopy hand-drawn arrow pointing down, for the hero. */
export function LoopArrow({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 120" className={`text-tangerine ${className}`}>
      <path
        d="M20 4 C 50 10, 52 40, 30 44 C 10 48, 14 24, 34 30 C 58 38, 50 80, 34 110"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M22 100 L 34 112 L 46 98"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
