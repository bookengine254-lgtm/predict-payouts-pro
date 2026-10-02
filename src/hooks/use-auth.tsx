import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Front-end session layer for the v1 skeleton. Accounts live in localStorage so
 * every route can render a signed-in shell, onboarding and profile without a
 * backend yet. Swap the four async helpers for Cloud auth calls later.
 */

export interface Account {
  email: string;
  username: string;
  name: string;
  initials: string;
  phone: string;
  bio: string;
  avatar: string | null;
  provider: "password" | "google";
  smsUpdates: boolean;
  mpesaReady: boolean;
  joinedCommunity: boolean;
  onboarded: boolean;
  createdAt: string;
}

export type AuthMode = "signin" | "signup" | "forgot";

const KEY = "polka-account";

export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/polka-forecasters";

function initialsOf(value: string) {
  const parts = value.replace(/[^a-zA-Z ]/g, " ").trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : value.slice(0, 2);
  return letters.toUpperCase();
}

interface AuthValue {
  account: Account | null;
  ready: boolean;
  /** Auth sheet */
  authMode: AuthMode | null;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  /** Onboarding sheet */
  onboarding: boolean;
  openOnboarding: () => void;
  signUp: (input: { email: string; password: string }) => void;
  signIn: (input: { email: string; password: string }) => void;
  signInWithGoogle: () => void;
  completeOnboarding: (input: {
    username: string;
    phone: string;
    mpesaReady: boolean;
    smsUpdates: boolean;
    joinedCommunity: boolean;
  }) => void;
  /** Profile customisation from Settings — persists to the local session. */
  updateProfile: (patch: Partial<Pick<Account, "name" | "username" | "phone" | "bio" | "avatar" | "initials">>) => void;
  signOut: () => void;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Account;
        setAccount({ ...parsed, bio: parsed.bio ?? "", avatar: parsed.avatar ?? null });
        if (!parsed.onboarded) setOnboarding(true);
      }
    } catch {
      /* no stored session */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Account | null) => {
    setAccount(next);
    try {
      if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable — session stays in memory */
    }
  }, []);

  const create = useCallback(
    (email: string, provider: Account["provider"]) => {
      const seed = email.split("@")[0] ?? "forecaster";
      const next: Account = {
        email,
        username: seed.toLowerCase().replace(/[^a-z0-9]/g, "") || "forecaster",
        name: seed.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        initials: initialsOf(seed),
        phone: "",
        bio: "",
        avatar: null,
        provider,
        smsUpdates: true,
        mpesaReady: false,
        joinedCommunity: false,
        onboarded: false,
        createdAt: new Date().toISOString(),
      };
      persist(next);
      setAuthMode(null);
      setOnboarding(true);
    },
    [persist],
  );

  const value = useMemo<AuthValue>(
    () => ({
      account,
      ready,
      authMode,
      openAuth: (mode: AuthMode = "signin") => setAuthMode(mode),
      closeAuth: () => setAuthMode(null),
      onboarding,
      openOnboarding: () => setOnboarding(true),
      signUp: ({ email }) => create(email, "password"),
      signIn: ({ email }) => {
        if (account && account.email.toLowerCase() === email.toLowerCase()) {
          setAuthMode(null);
          if (!account.onboarded) setOnboarding(true);
          return;
        }
        create(email, "password");
      },
      signInWithGoogle: () => {
        if (account) {
          setAuthMode(null);
          if (!account.onboarded) setOnboarding(true);
          return;
        }
        create("forecaster@gmail.com", "google");
      },
      completeOnboarding: (input) => {
        if (!account) return;
        const next: Account = {
          ...account,
          ...input,
          username: input.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
          name: input.username,
          initials: initialsOf(input.username),
          onboarded: true,
        };
        persist(next);
        setOnboarding(false);
      },
      updateProfile: (patch) => {
        if (!account) return;
        const username = patch.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? account.username;
        const name = patch.name?.trim() || account.name;
        persist({
          ...account,
          ...patch,
          username: username || account.username,
          name,
          initials: patch.initials ?? initialsOf(name || username),
        });
      },
      signOut: () => {
        persist(null);
        setOnboarding(false);
        setAuthMode(null);
      },
    }),
    [account, ready, authMode, onboarding, create, persist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
