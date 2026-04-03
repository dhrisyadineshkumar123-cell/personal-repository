/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',   // scan all files in src/
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: 'var(--secondary)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        critical: 'var(--critical)',
        info: 'var(--info)',
        sidebar: {
          DEFAULT: 'var(--sidebar-bg)',
          foreground: 'var(--sidebar-fg)',
          primary: 'var(--sidebar-primary)',
          accent: 'var(--sidebar-accent)',
          border: 'var(--sidebar-border)',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.5)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
 
