/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Elegant Burgundy palette - matches the reddish logo
        gold: {
          50: '#FDF2F4',
          100: '#FCE8EC',
          200: '#FAD4DC',
          300: '#F5ADBF',
          400: '#ED7A9A',
          500: '#8B2942', // Primary burgundy - matches logo
          600: '#7A2439',
          700: '#661E30',
          800: '#551928',
          900: '#4A0D1F',
          950: '#2D0613',
        },
        // Softer charcoal palette - lighter and milder
        charcoal: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#2D2D2D',
          900: '#1F1F1F', // Softer dark
          950: '#171717',
        },
        // Cream palette - for light sections & text areas
        cream: {
          50: '#FFFFFE',
          100: '#FFFDF8',
          200: '#FBF8F1',
          300: '#F5F0E6', // Primary cream - warm white
          400: '#EDE5D4',
          500: '#DDD3BE',
          600: '#C4B89E',
          700: '#A89A7C',
          800: '#8B7D5E',
          900: '#6E6349',
        },
        // Keep primary as burgundy for compatibility
        primary: {
          50: '#FDF2F4',
          100: '#FCE8EC',
          200: '#FAD4DC',
          300: '#F5ADBF',
          400: '#ED7A9A',
          500: '#8B2942',
          600: '#7A2439',
          700: '#661E30',
          800: '#551928',
          900: '#4A0D1F',
          950: '#2D0613',
        },
        // Keep secondary as charcoal for compatibility
        secondary: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#2D2D2D',
          900: '#1F1F1F',
          950: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'elegant': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'elegant-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.12)',
        'luxury': '0 4px 30px rgba(139, 41, 66, 0.1)',
        'luxury-lg': '0 8px 50px rgba(139, 41, 66, 0.15)',
        'gold-glow': '0 0 30px rgba(139, 41, 66, 0.2)',
        'gold-glow-lg': '0 0 50px rgba(139, 41, 66, 0.3)',
        'dark': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.6)',
        'inner-gold': 'inset 0 2px 20px 0 rgba(139, 41, 66, 0.1)',
        'inner-dark': 'inset 0 2px 20px 0 rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gold-shimmer': 'goldShimmer 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% 0', opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { backgroundPosition: '200% 0', opacity: '0.5' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 41, 66, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 41, 66, 0.4)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'luxury': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'gold-gradient': 'linear-gradient(135deg, #8B2942 0%, #ED7A9A 50%, #8B2942 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(139, 41, 66, 0.3) 50%, transparent 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1F1F1F 0%, #171717 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #2D2D2D 0%, #404040 50%, #2D2D2D 100%)',
      },
    },
  },
  plugins: [],
};
