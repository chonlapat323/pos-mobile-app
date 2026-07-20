// Design tokens — Premium Dark + Champagne Gold.
// Color values must stay in sync with `tailwind.config.js`'s `theme.extend.colors`.

export const colors = {
  bg: "#16151a",
  surface: "#1c1b21",
  surfaceAlt: "#1a191f",
  card: "#201f26",
  cardAlt: "#26252c",
  cardLine: "#23222a",
  raised: "#2c2b33",
  raisedHover: "#33323b",
  inputBg: "#16151a",

  text: "#f2f0ee",
  textSoft: "#cfcbc4",
  muted: "#9d9992",
  muted2: "#8f8b86",
  faint: "#6d6963",

  accent: "#c9a86a",
  accentText: "#1a1712",
  accentSoft: "rgba(201,168,106,0.12)",
  accentBorder: "rgba(201,168,106,0.35)",

  success: "#5fd08f",
  successSoft: "rgba(79,191,128,0.20)",
  danger: "#d08a8a",
  dangerSoft: "rgba(200,80,80,0.14)",

  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.14)",
  divider: "rgba(255,255,255,0.08)",
  receiptPaper: "#f6f3ee",
  receiptInk: "#2a2620",
} as const;

export const font = {
  ui: "Anuphan_400Regular",
  uiMedium: "Anuphan_500Medium",
  uiSemibold: "Anuphan_600SemiBold",
  uiBold: "Anuphan_700Bold",
  serif: "NotoSerifThai_600SemiBold",
} as const;

export const radius = { sm: 8, md: 11, lg: 13, xl: 16, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22 } as const;

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
} as const;

// Category thumbnail gradient pairs (used with expo-linear-gradient).
export const catGradient: Record<string, [string, string]> = {
  nail: ["#4a2f3f", "#2e2029"],
  lash: ["#4a3a2a", "#2e2620"],
  spa: ["#2c4536", "#202e26"],
  facial: ["#2a3f45", "#20292e"],
  hair: ["#3d2f4a", "#28202e"],
  wax: ["#454236", "#2e2c20"],
};

export const fmt = (n: number) => `฿${Number(n).toLocaleString("th-TH")}`;
