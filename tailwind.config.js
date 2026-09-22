/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        ink: '#0a0712',
        panel: '#171022',
        plum: '#27143d',
        champagne: '#f3d69d',
      },
      boxShadow: {
        glow: '0 16px 46px rgba(125, 73, 167, .25)',
        card: '0 14px 34px rgba(0, 0, 0, .26)',
      },
      backgroundImage: {
        'admin-mesh': 'radial-gradient(circle at 14% 0%, rgba(168, 85, 247, .22), transparent 30%), radial-gradient(circle at 95% 15%, rgba(243, 214, 157, .12), transparent 28%), linear-gradient(135deg, #0a0712 0%, #120a1d 50%, #0a0712 100%)',
      },
    },
  },
  plugins: [],
};
