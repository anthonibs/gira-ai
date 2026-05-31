import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Rajdhani', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        app: {
          text: 'var(--text-primary)',
          panel: 'var(--panel-bg)',
          muted: 'var(--panel-muted)',
          accent: 'var(--accent-strong)',
        },
      },
    },
  },
}

export default config
