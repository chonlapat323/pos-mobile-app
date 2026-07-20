/** @type {import('tailwindcss').Config} */
// Color values must stay in sync with `lib/theme.ts`'s `colors` export — this file
// can't import that TS module directly at Tailwind-config load time.
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#16151a",
        surface: "#1c1b21",
        "surface-alt": "#1a191f",
        card: "#201f26",
        "card-alt": "#26252c",
        "card-line": "#23222a",
        raised: "#2c2b33",
        "raised-hover": "#33323b",
        "input-bg": "#16151a",

        text: "#f2f0ee",
        "text-soft": "#cfcbc4",
        muted: "#9d9992",
        muted2: "#8f8b86",
        faint: "#6d6963",

        accent: "#c9a86a",
        "accent-text": "#1a1712",
        "accent-soft": "rgba(201,168,106,0.12)",
        "accent-border": "rgba(201,168,106,0.35)",

        success: "#5fd08f",
        "success-soft": "rgba(79,191,128,0.20)",
        danger: "#d08a8a",
        "danger-soft": "rgba(200,80,80,0.14)",

        border: "rgba(255,255,255,0.06)",
        "border-mid": "rgba(255,255,255,0.09)",
        "border-strong": "rgba(255,255,255,0.14)",
        divider: "rgba(255,255,255,0.08)",
        "receipt-paper": "#f6f3ee",
        "receipt-ink": "#2a2620",
      },
      fontFamily: {
        ui: ["Anuphan_400Regular"],
        "ui-medium": ["Anuphan_500Medium"],
        "ui-semibold": ["Anuphan_600SemiBold"],
        "ui-bold": ["Anuphan_700Bold"],
        serif: ["NotoSerifThai_600SemiBold"],
      },
      borderRadius: {
        sm: "8px",
        md: "11px",
        lg: "13px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
