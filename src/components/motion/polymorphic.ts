import type { ComponentType, ReactNode, Ref } from "react";

/**
 * The prop shape the motion primitives pass to whatever element their `as`
 * prop resolves to. See the comment at the cast site in `reveal.tsx`.
 */
export type PolymorphicTag = ComponentType<{
  ref: Ref<HTMLElement>;
  className?: string;
  "data-animate"?: boolean;
  children?: ReactNode;
}>;
