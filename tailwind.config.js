/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        muted: 'hsl(var(--muted))',
        primary: 'hsl(var(--primary))',
        border: 'hsl(var(--border))',
        // Pricing page palette (zenlove source-of-truth)
        'zen-primary': '#e54153',
        'zen-primary-hover': '#f26b76',
        'zen-primary-active': '#bf2c42',
        'zen-black': '#0f172a',
      },
      borderRadius: { pill: 'var(--radius)' },
      boxShadow: { soft: '2px 4px 12px rgba(0,0,0,.08)' },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        'marquee-reverse': { '0%': { transform: 'translateY(-50%)' }, '100%': { transform: 'translateY(0)' } },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
