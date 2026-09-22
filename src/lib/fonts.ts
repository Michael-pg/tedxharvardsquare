import { Figtree } from "next/font/google";

/**
 * Note the `-src` suffix: Tailwind owns `--font-sans` as a theme token, and
 * that token composes this one with its fallback stack. Naming them the same
 * would make the variable reference itself.
 */
export const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

export const fontVariables = sans.variable;
