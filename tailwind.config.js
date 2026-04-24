/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      colors: {
        // Figma Weave Color Palette
        'weave': {
          'bg-primary': '#0B0B0E',
          'bg-secondary': '#0a0a0c',
          'border': 'rgba(255, 255, 255, 0.1)',
          'border-hover': 'rgba(255, 255, 255, 0.2)',
          'glass': 'rgba(255, 255, 255, 0.05)',
          'glass-hover': 'rgba(255, 255, 255, 0.1)',
        },
        // 5 Pillars Colors
        'pillar': {
          'research': '#3b82f6',
          'code': '#10b981', 
          'content': '#8b5cf6',
          'imagine': '#f97316',
          'video': '#ef4444',
          'technical': '#6b7280',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.2), 0 0 10px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.2)' 
          },
          '100%': { 
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.4)' 
          },
        },
        slideInLeft: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      aspectRatio: {
        'square': '1 / 1',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'inner-glow': 'inset 0 0 10px rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}