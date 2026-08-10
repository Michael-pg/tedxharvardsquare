import { Inter } from "next/font/google";

/**
 * PLACEHOLDER TYPE STACK.
 *
 * TEDx brand guidelines specify Helvetica Neue. Inter is standing in until the
 * type direction is settled — it is a neutral grotesque with a similar skeleton
 * and a full variable axis. Swapping the typeface should only require editing
 * this file plus the `--font-*` tokens in `globals.css`.
 */
/**
 * Note the `-src` suffix: Tailwind owns `--font-sans` as a theme token, and
 * that token composes this one with its fallback stack. Naming them the same
 * would make the variable reference itself.
 */
export const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

export const fontVariables = sans.variable;
