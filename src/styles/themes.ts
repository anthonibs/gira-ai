export const THEME_DEFINITIONS = {
  sunset: {
    label: 'Por do Sol',
    wheelPalette: [
      '#f97316',
      '#fb923c',
      '#f59e0b',
      '#facc15',
      '#84cc16',
      '#22c55e',
      '#14b8a6',
      '#06b6d4',
      '#0ea5e9',
      '#3b82f6',
      '#6366f1',
      '#ef4444',
    ],
  },
  oceano: {
    label: 'Oceano',
    wheelPalette: [
      '#2563eb',
      '#0284c7',
      '#06b6d4',
      '#14b8a6',
      '#22c55e',
      '#0ea5e9',
      '#1d4ed8',
      '#38bdf8',
      '#2dd4bf',
      '#3b82f6',
      '#0f766e',
      '#0369a1',
    ],
  },
  lava: {
    label: 'Lava',
    wheelPalette: [
      '#ef4444',
      '#f97316',
      '#fb7185',
      '#f43f5e',
      '#ea580c',
      '#dc2626',
      '#f59e0b',
      '#fb923c',
      '#be123c',
      '#b91c1c',
      '#f87171',
      '#e11d48',
    ],
  },
} as const

export type VisualStyle = keyof typeof THEME_DEFINITIONS

export const VISUAL_STYLE_OPTIONS = Object.keys(
  THEME_DEFINITIONS,
) as VisualStyle[]
