export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#1f2937",
        card: "#ffffff",
        "card-foreground": "#1f2937",
        primary: "#1e40af",
        "primary-foreground": "#ffffff",
        secondary: "#3b82f6",
        accent: "#dbeafe",
        destructive: "#dc2626",
        muted: "#f3f4f6",
        border: "rgba(0, 0, 0, 0.1)",
        ring: "#3b82f6",
      },
      borderRadius: {
        DEFAULT: "0.625rem",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};
