import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

const KEY = "polka-theme";

function apply(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

/**
 * Dark is the product default. The stored choice is read after hydration so the
 * server-rendered markup and the first client render always agree.
 */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const next: ThemeMode = stored === "light" ? "light" : "dark";
    setMode(next);
    apply(next);
  }, []);

  const set = useCallback((next: ThemeMode) => {
    setMode(next);
    apply(next);
    window.localStorage.setItem(KEY, next);
  }, []);

  const toggle = useCallback(() => set(mode === "dark" ? "light" : "dark"), [mode, set]);

  return { mode, set, toggle };
}
