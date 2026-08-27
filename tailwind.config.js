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
      },
      borderRadius: { pill: 'var(--radius)' },
      boxShadow: { soft: '2px 4px 12px rgba(0,0,0,.08)' },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        'marquee-reverse': { '0%': { transform: 'translateY(-50%)' }, '100%': { transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
