import { useEffect, useState } from "react";

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function getCurrentBreakpoint(): Breakpoint {
  const width = window.innerWidth;
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  return "sm";
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

export function useIsMobile() {
  const breakpoint = useBreakpoint();
  return breakpoint === "sm";
}

export function useIsTablet() {
  const breakpoint = useBreakpoint();
  return breakpoint === "md";
}

export function useIsDesktop() {
  const breakpoint = useBreakpoint();
  return breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";
}

export function useIsLarge() {
  const breakpoint = useBreakpoint();
  return breakpoint === "xl" || breakpoint === "2xl";
}