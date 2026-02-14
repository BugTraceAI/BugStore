/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'hive-dark': '#0D0A1A',
                'hive-deep': '#1A0F2E',
                'hive-medium': '#2D1B4D',
                'hive-light': '#3D2B5F',
                'hive-border': '#4D3B6F',
                'hive-elevated': '#5D4B7F',
                coral: {
                    DEFAULT: '#FF7F50',
                    hover: '#FF9B70',
                    active: '#E56B3C',
                    glow: 'rgba(255, 127, 80, 0.4)',
                },
                'hive-text': '#F8F9FA',
                'hive-muted': '#B0A8C0',
                'hive-subtle': '#8A7FA8',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(255, 127, 80, 0.3)',
                'glow-lg': '0 0 40px rgba(255, 127, 80, 0.4)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
                'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
            },
            backgroundImage: {
                'grid-pattern': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            },
            backgroundSize: {
                'grid': '60px 60px',
            },
        },
    },
    plugins: [],
}
