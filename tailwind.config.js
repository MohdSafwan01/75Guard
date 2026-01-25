/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // State-driven colors from Design Document
                critical: {
                    DEFAULT: '#DC2626',
                    light: '#FEE2E2',
                    surface: '#FEF2F2',
                    border: '#EF4444',
                },
                tension: {
                    DEFAULT: '#F59E0B',
                    light: '#FEF3C7',
                    surface: '#FFFBEB',
                    border: '#FCD34D',
                },
                safe: {
                    DEFAULT: '#10B981',
                    light: '#D1FAE5',
                    surface: '#FAFAFA',
                    border: '#E5E7EB',
                },
                // Base colors
                'warm-dark-grey': '#374151',
                'soft-off-white': '#FAFAFA',
                'near-black': '#111827',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'display': '32px',
                'heading': '20px',
                'body': '16px',
                'small': '14px',
            },
            spacing: {
                // State-specific spacing
                'safe': '24px',
                'tension': '16px',
                'critical': '12px',
            },
            transitionDuration: {
                // Animation durations per state
                'safe': '600ms',
                'tension': '300ms',
                'critical': '150ms',
            },
            animation: {
                'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
                'ring-grow': 'ringGrow 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                'unsafe-advance': 'unsafeAdvance 300ms ease-out forwards',
                'button-pulse': 'buttonPulse 300ms ease-out',
            },
            keyframes: {
                subtlePulse: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.85', transform: 'scale(1.02)' },
                },
                ringGrow: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                unsafeAdvance: {
                    '0%': { transform: 'scaleX(1)' },
                    '50%': { transform: 'scaleX(1.05)' },
                    '100%': { transform: 'scaleX(1)' },
                },
                buttonPulse: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(0.95)' },
                    '100%': { transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
