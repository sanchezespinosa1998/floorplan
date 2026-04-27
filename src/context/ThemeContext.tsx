import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "base" | "dark" | "light" | "ocean" | "sunset" | "forest" | "dune" | "graphite";

interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
  preview: {
    bg: string;
    surface: string;
    accent: string;
  };
}

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  themeOptions: ThemeOption[];
}

const STORAGE_KEY_THEME = "fairplan-theme-mode";

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "base",
    label: "Base",
    description: "Modo primigenio original del dashboard",
    preview: {
      bg: "#0a0a0a",
      surface: "#141414",
      accent: "#8fee00",
    },
  },
  {
    id: "dark",
    label: "Dark",
    description: "Contraste alto y acento lima técnico",
    preview: {
      bg: "#0b0d10",
      surface: "#171b20",
      accent: "#b8f35d",
    },
  },
  {
    id: "light",
    label: "Light",
    description: "Base clara, limpio editorial y acento turquesa",
    preview: {
      bg: "#f7f3ea",
      surface: "#ffffff",
      accent: "#0e7490",
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Tonos marinos fríos con cian brillante",
    preview: {
      bg: "#081017",
      surface: "#0f1d2a",
      accent: "#35d0ff",
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Contraste cálido con acento ámbar",
    preview: {
      bg: "#1a0f0a",
      surface: "#2a180f",
      accent: "#ffb347",
    },
  },
  {
    id: "forest",
    label: "Forest",
    description: "Verdes profundos y atmósfera natural",
    preview: {
      bg: "#0c140f",
      surface: "#152018",
      accent: "#6ee7b7",
    },
  },
  {
    id: "dune",
    label: "Dune",
    description: "Arena suave con acento cobre",
    preview: {
      bg: "#1a1711",
      surface: "#252016",
      accent: "#f59e0b",
    },
  },
  {
    id: "graphite",
    label: "Graphite",
    description: "Escala neutra con acento eléctrico",
    preview: {
      bg: "#101114",
      surface: "#1a1c21",
      accent: "#60a5fa",
    },
  },
];

const VALID_THEME_IDS = new Set<ThemeMode>(THEME_OPTIONS.map((option) => option.id));

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";

    const storedTheme = window.localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
    if (!storedTheme || !VALID_THEME_IDS.has(storedTheme)) {
      return "dark";
    }

    return storedTheme;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY_THEME, themeMode);

    const html = window.document.documentElement;
    html.setAttribute("data-theme", themeMode);

    // Keep shadcn primitives in dark for all non-light theme variants.
    if (themeMode === "light") {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
  }, [themeMode]);

  const value = useMemo<ThemeContextValue>(() => ({
    themeMode,
    setThemeMode,
    themeOptions: THEME_OPTIONS,
  }), [themeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
