/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    900: '#7c2d12',
                },
                accent: {
                    yellow: '#facc15',
                }
            },
            fontFamily: {
                sans: ['"Hiragino Kaku Gothic ProN"', '"Noto Sans JP"', 'sans-serif'],
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
                },
                'bounce-short': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pop: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                'bounce-short': 'bounce-short 0.5s ease-in-out 1',
                pop: 'pop 0.3s ease-in-out',
                'fade-in': 'fade-in 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
