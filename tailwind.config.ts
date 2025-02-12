import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class'],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'static': 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAG1BMVEUAAAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzPpGqIxAAAACXBIWXMAAAABAAAAAQBPJcTWAAAAIElEQVQ4jWNgYBBgZBwIwIhfgIWBgYWBgYVxIAAj/QQAj+IAf/J9NQAAAAAASUVORK5CYII=")',
        'scanlines': 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 2px)',
        'crt': 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 90%, rgba(0,0,0,0.4) 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'tv-switch': {
          '0%': { transform: 'scale(1) skewX(0deg)', filter: 'brightness(1)' },
          '25%': { transform: 'scale(0.9) skewX(5deg)', filter: 'brightness(1.2)' },
          '50%': { transform: 'scale(0.95) skewX(-5deg)', filter: 'brightness(0.8)' },
          '75%': { transform: 'scale(1.05) skewX(5deg)', filter: 'brightness(1.1)' },
          '100%': { transform: 'scale(1) skewX(0deg)', filter: 'brightness(1)' },
        },
        'static': {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '0.8' },
          '25%': { transform: 'translateX(-1%) translateY(1%)', opacity: '0.9' },
          '50%': { transform: 'translateX(1%) translateY(-1%)', opacity: '0.7' },
          '75%': { transform: 'translateX(-1%) translateY(1%)', opacity: '0.8' },
          '100%': { transform: 'translateX(0) translateY(0)', opacity: '0.8' },
        },
        'scanline': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-in-out',
        'fade-out': 'fade-out 0.2s ease-in-out',
        'tv-switch': 'tv-switch 0.5s ease-in-out',
        'static': 'static 0.1s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
