import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "dark" | "light";
export type TextScale = "compact" | "default" | "large";

export interface Prefs {
  theme: ThemeMode;
  textScale: TextScale;
  /** Notifications */
  notifyResolutions: boolean;
  notifyPriceMoves: boolean;
  notifyInvites: boolean;
  notifyWhatsapp: boolean;
  /** Play & safety */
  stakeConfirm: boolean;
  weeklyLimit: number;
  hideBalances: boolean;
  /** Privacy */
  publicProfile: boolean;
  showOnLeaderboard: boolean;
  /** Feel */
  reduceMotion: boolean;
  sounds: boolean;
}

const DEFAULTS: Prefs = {
  theme: "dark",
  textScale: "default",
  notifyResolutions: true,
  notifyPriceMoves: true,
  notifyInvites: true,
  notifyWhatsapp: false,
  stakeConfirm: true,
  weeklyLimit: 10_000,
  hideBalances: false,
  publicProfile: true,
  showOnLeaderboard: true,
  reduceMotion: false,
  sounds: true,
};

const SCALE: Record<TextScale, number> = { compact: 0.94, default: 1, large: 1.12 };

const KEY = "polka-prefs";

const Ctx = createContext<{
  prefs: Prefs;
  set: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  reset: () => void;
} | null>(null);

function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  root.classList.toggle("dark", p.theme === "dark");
  root.style.colorScheme = p.theme;
  root.style.setProperty("--app-scale", String(SCALE[p.textScale]));
  root.dataset["motion"] = p.reduceMotion ? "reduced" : "full";
}

/**
 * Single source of truth for look-and-feel and account preferences.
 * Dark + default scale render on the server; the stored choice is applied after
 * hydration so the first client paint always matches the server markup.
 */
export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    let next = DEFAULTS;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) next = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
    } catch {
      next = DEFAULTS;
    }
    setPrefs(next);
    applyPrefs(next);
  }, []);

  const set = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      applyPrefs(next);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — preference stays for this session */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULTS);
    applyPrefs(DEFAULTS);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ prefs, set, reset }), [prefs, set, reset]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrefs must be used inside <PrefsProvider>");
  return ctx;
}
