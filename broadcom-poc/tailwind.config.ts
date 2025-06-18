import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// EchoStor Brand Colors - Based on actual website
				echostor: {
					// Dark navy - primary background color from website
					navy: {
						50: '#f1f5f9',
						100: '#e2e8f0',
						200: '#cbd5e1',
						300: '#94a3b8',
						400: '#64748b',
						500: '#475569',
						600: '#334155',
						700: '#1e293b',
						800: '#0f172a', // Main dark navy from website
						900: '#020617', // Darker navy
						950: '#0a0e1a'  // Darkest navy
					},
					// Bright lime green - for CTAs and primary actions (from website buttons)
					lime: {
						50: '#f7fee7',
						100: '#ecfccb',
						200: '#d9f99d',
						300: '#bef264',
						400: '#a3e635', // Main CTA green from website
						500: '#84cc16',
						600: '#65a30d',
						700: '#4d7c0f',
						800: '#365314',
						900: '#1a2e05'
					},
					// Teal/cyan - accent colors only (from geometric shapes)
					teal: {
						50: '#f0fdfa',
						100: '#ccfbf1',
						200: '#99f6e4',
						300: '#5eead4',
						400: '#2dd4bf', // Light teal accent
						500: '#14b8a6', // Medium teal accent
						600: '#0891b2', // Darker teal accent
						700: '#0e7490',
						800: '#155e75',
						900: '#164e63'
					},
					// Cyan - for accent highlights
					cyan: {
						50: '#ecfeff',
						100: '#cffafe',
						200: '#a5f3fc',
						300: '#67e8f9',
						400: '#22d3ee', // Bright cyan accent
						500: '#06b6d4',
						600: '#0891b2',
						700: '#0e7490',
						800: '#155e75',
						900: '#164e63'
					},
					// Clean grays for UI elements
					gray: {
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
					// Keep red for error states
					red: {
						50: '#fef2f2',
						100: '#fde5e7',
						200: '#faccce',
						300: '#f6a1a5',
						400: '#f06a71',
						500: '#e53e46',
						600: '#d12b34',
						700: '#AE0E2A',
						800: '#8a1a1d',
						900: '#721619',
						950: '#4c0b0d'
					}
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
			},
			boxShadow: {
				'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'header': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
				'lime-glow': '0 0 20px rgba(163, 230, 53, 0.3)',
				'teal-glow': '0 0 15px rgba(45, 212, 191, 0.25)',
				'navy-inset': 'inset 0 1px 3px 0 rgba(15, 23, 42, 0.3)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gradient-shift': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-shift': 'gradient-shift 3s ease infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
