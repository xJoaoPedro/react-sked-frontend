import animate from "tailwindcss-animate";
import { Config } from "tailwindcss";

export const theme = {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      primary: 'var(--primary)',
      'primary-foreground': 'var(--primary-foreground)',
      border: 'var(--border)',
      ring: 'var(--ring)',
    },
    borderColor: {
      border: 'var(--border)',
    },
    outlineColor: {
      ring: 'var(--ring)',
    },
  },
};

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme,
  plugins: [animate],
};

export default config;