/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        mist: '#F8FAFC',
        accent: '#7C3AED',
        calm: '#14B8A6',
        glow: '#C4B5FD',
      },
      fontFamily: {
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'soft-gradient': 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(20,184,166,0.12), transparent 30%)',
      },
    },
  },
  plugins: [],
};
