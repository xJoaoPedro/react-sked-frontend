import animate from "tailwindcss-animate";
import { Config } from "tailwindcss";

export const theme = {
  extend: {
    colors: {
      /* Base */
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",

      /* Primary */
      primary: "hsl(var(--primary))",
      "primary-foreground": "hsl(var(--primary-foreground))",

      /* Card */
      card: "hsl(var(--card))",
      "card-foreground": "hsl(var(--card-foreground))",

      /* Popover */
      popover: "hsl(var(--popover))",
      "popover-foreground": "hsl(var(--popover-foreground))",

      /* Secondary */
      secondary: "hsl(var(--secondary))",
      "secondary-foreground": "hsl(var(--secondary-foreground))",

      /* Muted */
      muted: "hsl(var(--muted))",
      "muted-foreground": "hsl(var(--muted-foreground))",

      /* Accent */
      accent: "hsl(var(--accent))",
      "accent-foreground": "hsl(var(--accent-foreground))",

      /* Destructive */
      destructive: "hsl(var(--destructive))",
      "destructive-foreground": "hsl(var(--destructive-foreground))",

      /* UI */
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",

      /* Extras */
      "input-background": "hsl(var(--input-background))",
      "switch-background": "hsl(var(--switch-background))",

      /* Charts */
      "chart-1": "hsl(var(--chart-1))",
      "chart-2": "hsl(var(--chart-2))",
      "chart-3": "hsl(var(--chart-3))",
      "chart-4": "hsl(var(--chart-4))",
      "chart-5": "hsl(var(--chart-5))",

      /* Sidebar */
      sidebar: "hsl(var(--sidebar))",
      "sidebar-foreground": "hsl(var(--sidebar-foreground))",

      "sidebar-primary": "hsl(var(--sidebar-primary))",
      "sidebar-primary-foreground": "hsl(var(--sidebar-primary-foreground))",

      "sidebar-accent": "hsl(var(--sidebar-accent))",
      "sidebar-accent-foreground": "hsl(var(--sidebar-accent-foreground))",

      "sidebar-border": "hsl(var(--sidebar-border))",
      "sidebar-ring": "hsl(var(--sidebar-ring))",
    },

    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
  },
};

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", // 👈 ESSENCIAL pro shadcn
  ],
  theme,
  plugins: [animate],
};

export default config;