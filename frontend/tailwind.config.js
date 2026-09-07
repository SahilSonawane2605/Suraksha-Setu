/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#020b16',
        sidebar: '#07111f',
        card: '#0b1625',
        border: '#1c2b3d',
        primary: '#e5e7eb',
        muted: '#94a3b8',
        risk: {
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#84cc16',
          safe: '#14b8a6',
        },
        accent: {
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
