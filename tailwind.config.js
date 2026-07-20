import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                theme: {
                    50: 'var(--theme-50)',
                    100: 'var(--theme-100)',
                    200: 'var(--theme-200)',
                    400: 'var(--theme-400)',
                    500: 'var(--theme-500)',
                    600: 'var(--theme-600)',
                    700: 'var(--theme-700)',
                    800: 'var(--theme-800)',
                    900: 'var(--theme-900)',
                },
                bsmi: {
                    50:  '#FFF0F0',
                    100: '#FFE0E0',
                    200: '#FFC0C0',
                    300: '#FF9090',
                    400: '#FF5050',
                    500: '#FF2020',
                    600: '#CC0001',
                    700: '#A00001',
                    800: '#800001',
                    900: '#600001',
                    950: '#400000',
                },
            },
            animation: {
                'fade-in':    'fadeIn 0.2s ease-in-out',
                'slide-in':   'slideIn 0.3s ease-out',
                'bounce-in':  'bounceIn 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%':   { opacity: '0', transform: 'translateX(-10px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                bounceIn: {
                    '0%':   { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },

    plugins: [forms],
};
