module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        muted: "var(--muted)",
        "dark-bg": "var(--dark-bg)",
        "dark-card": "var(--dark-card)",
        "dark-border": "var(--dark-border)",
        "dark-text": "var(--dark-text)",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
