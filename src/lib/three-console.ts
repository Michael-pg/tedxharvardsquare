import { getConsoleFunction, setConsoleFunction } from "three";

/**
 * Drops known three.js warnings that come from dependencies, not from us, and
 * that we cannot act on. Everything else is forwarded exactly as three.js
 * would print it.
 *
 * Uses three's own `setConsoleFunction` hook, so no global `console` patching.
 * Imported for its side effect by `components/canvas/scene.tsx`, which runs
 * before any R3F store exists.
 */

const SILENCED = [
  // R3F v9's store creates `new THREE.Clock()`, deprecated in three r183. Fixed
  // in R3F v10 (which uses THREE.Timer) — delete this entry after upgrading.
  "THREE.Clock: This module has been deprecated",
];

type ConsoleType = "log" | "warn" | "error";

type StackTraceLike = { isStackTrace: true; getError: (message: string) => Error };

const isStackTrace = (value: unknown): value is StackTraceLike =>
  typeof value === "object" && value !== null && "isStackTrace" in value;

const previous = getConsoleFunction();

setConsoleFunction((type: ConsoleType, message: string, ...params: unknown[]) => {
  if (SILENCED.some((prefix) => message.startsWith(prefix))) return;

  if (previous) {
    previous(type, message, ...params);
  } else if (isStackTrace(params[0])) {
    // Mirrors three's default: attach the captured stack trace when present.
    console[type](params[0].getError(message));
  } else {
    console[type](message, ...params);
  }
});
