"use client";

import { ReactNode } from "react";
import { useState, useEffect } from "react";
export function IsBreakpoint({
  breakpoint,
  children,
  otherwise,
}: {
  breakpoint: string;
  children: ReactNode;
  otherwise?: ReactNode;
}) {
  const matches = useIsBreakpoint(breakpoint);
  return matches ? children : (otherwise ?? null);
}

export function useIsBreakpoint(breakpoint: string) {
  const [isBreakpoint, setIsBreakpoint] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(breakpoint).matches
      : false,
  );

  useEffect(() => {
    const controller = new AbortController();
    const media = window.matchMedia(breakpoint);

    const handler = (e: MediaQueryListEvent) => {
      setIsBreakpoint(e.matches);
    };

    media.addEventListener("change", handler, { signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [breakpoint]);

  return isBreakpoint;
}
