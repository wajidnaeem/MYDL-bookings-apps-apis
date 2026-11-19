import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, setToken } from '@/lib/api';
import { registerPushToken } from '@/lib/push';
import { clearToken, loadToken, saveToken } from '@/lib/session';

type AuthContextValue = {
  ready: boolean;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    loadToken()
      .then(async (stored) => {
        if (!stored) return;
        setToken(stored);
        await api.me();
        if (active) setSignedIn(true);
      })
      .catch(async () => {
        setToken('');
        await clearToken();
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (signedIn) {
      registerPushToken().catch(() => {});
    }
  }, [signedIn]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      signedIn,
      async signIn(email, password) {
        const result = await api.login(email, password);
        setToken(result.token);
        await saveToken(result.token);
        setSignedIn(true);
      },
      async register(input) {
        await api.register(input);
      },
      async verify(email, code) {
        const result = await api.verify(email, code);
        setToken(result.token);
        await saveToken(result.token);
        setSignedIn(true);
      },
      async requestReset(email) {
        await api.forgot(email);
      },
      async resetPassword(email, code, password) {
        await api.reset(email, code, password);
      },
      async signOut() {
        setToken('');
        setSignedIn(false);
        await clearToken();
      },
    }),
    [ready, signedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
