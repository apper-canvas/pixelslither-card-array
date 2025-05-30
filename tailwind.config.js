/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ff88',
          light: '#4dffab',
          dark: '#00cc6a'
        },
        secondary: {
          DEFAULT: '#ff0080',
          light: '#ff4da6',
          dark: '#cc0066'
        },
        accent: '#ffff00',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        neon: {
          green: '#00ff88',
          pink: '#ff0080',
          blue: '#0088ff',
          yellow: '#ffff00',
          purple: '#8800ff'
        }
}
},
        border: 'hsl(214.3 31.8% 91.4%)',
        background: 'hsl(0 0% 3.9%)',
        foreground: 'hsl(210 40% 98%)'
      },
      fontFamily: {
        sans: ['Exo 2', 'ui-sans-serif', 'system-ui'],
        heading: ['Orbitron', 'ui-sans-serif', 'system-ui'],
        game: ['Orbitron', 'monospace']
      },
      boxShadow: {
        'neon-green': '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88',
        'neon-pink': '0 0 5px #ff0080, 0 0 10px #ff0080, 0 0 15px #ff0080',
        'neon-blue': '0 0 5px #0088ff, 0 0 10px #0088ff, 0 0 15px #0088ff',
        'neon-yellow': '0 0 5px #ffff00, 0 0 10px #ffff00, 0 0 15px #ffff00',
        'retro': '4px 4px 0px #000000',
        'game-board': 'inset 0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'snake-move': 'snake-move 0.2s ease-in-out',
        'food-bounce': 'food-bounce 1s ease-in-out infinite'
      },
      keyframes: {
        'pulse-neon': {
          'from': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88' },
          'to': { boxShadow: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88' }
        },
        'glow': {
          'from': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          'to': { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' }
        },
        'snake-move': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        'food-bounce': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)' }
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}