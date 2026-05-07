/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "#080c14",
          2: "#0d1320",
          3: "#111827",
          4: "#1a2333",
        },
        border: { DEFAULT: "#1e2d45", 2: "#263548" },
        cyan: { DEFAULT: "#06b6d4", 2: "#22d3ee", dim: "rgba(6,182,212,0.10)" },
        amber: { DEFAULT: "#f59e0b", 2: "#fbbf24" },
      },
      animation: {
        sweep: "sweep 1.4s linear infinite",
        fadeUp: "fadeUp 0.4s ease forwards",
        pulse2: "pulse2 2s ease-in-out infinite",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-250%)" },
          "100%": { transform: "translateX(350%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
}
