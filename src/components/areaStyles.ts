import type { AreaId } from '../lib/areas'

/** Static class names so Tailwind can see them. Colours are defined in styles/index.css. */
export const AREA_BG: Record<AreaId | 'free', string> = {
  sleep: 'bg-area-sleep',
  work: 'bg-area-work',
  food: 'bg-area-food',
  chores: 'bg-area-chores',
  childcare: 'bg-area-childcare',
  fitness: 'bg-area-fitness',
  entertainment: 'bg-area-entertainment',
  relationships: 'bg-area-relationships',
  free: 'bg-area-free',
}

/**
 * Hex colours for charts and exported images (SVG fills and html-to-image need real
 * values). Keep in sync with the `--color-area-*` tokens in styles/index.css; they
 * are the same in light and dark mode.
 */
export const AREA_COLOR: Record<AreaId | 'free', string> = {
  sleep: '#a4c2f4',
  work: '#cccccc',
  food: '#ea9999',
  chores: '#b6d7a8',
  childcare: '#ffe599',
  fitness: '#f9cb9c',
  entertainment: '#b4a7d6',
  relationships: '#d5a6bd',
  free: '#7fd1c4',
}
