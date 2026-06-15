/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        surface: {
          DEFAULT: '#050505',
          50: '#0a0a0a',
          100: '#111111',
          200: '#1a1a1a',
          300: '#222222',
          400: '#333333',
        },
        accent: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
          light: '#f5f5f5',
          dark: '#cccccc',
          muted: 'rgba(255, 255, 255, 0.15)',
        },
        success: {
          DEFAULT: '#22c55e',
          muted: 'rgba(34, 197, 94, 0.15)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245, 158, 11, 0.15)',
        },
        danger: {
          DEFAULT: '#ef4444',
          muted: 'rgba(239, 68, 68, 0.15)',
        },
        info: {
          DEFAULT: '#06b6d4',
          muted: 'rgba(6, 182, 212, 0.15)',
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.2)',
        'card': '0 4px 16px rgba(0,0,0,0.3)',
        'glow-accent': '0 0 20px rgba(255, 255, 255, 0.1)',
        'glow-success': '0 0 20px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
