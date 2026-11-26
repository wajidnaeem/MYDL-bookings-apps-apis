import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Business, Dashboard, Dispute, Notice, Policy, Visit } from '@/lib/types';

type ProviderContextValue = Dashboard & {
  createVisit: (input: Parameters<typeof api.createVisit>[0]) => Promise<string>;
  saveSettings: (input: Partial<Business & Policy>) => Promise<void>;
  connectPayout: () => Promise<string>;
  makeQr: (id: string) => Promise<{ token: string; expiresAt?: number }>;
  cancelVisit: (id: string) => Promise<void>;
  reportNoShow: (id: string, note: string) => Promise<string>;
  updateVisit: (id: string, input: Parameters<typeof api.updateVisit>[1]) => Promise<void>;
  raiseDispute: (input: { title: string; detail: string; evidenceFile?: { name: string; data: string }; appointmentId?: string }) => Promise<string>;
  refresh: () => Promise<void>;
};

const empty: Dashboard = {
  profile: { name: '', email: '', phone: '' },
  business: { businessName: '', serviceDetails: '', location: '', contact: '', payoutMethod: '', payoutDetails: '' },
  policy: { lateAfterMinutes: 15, lateFee: '$10.00', noShow: '', cancellation: '' },
  appointments: [],
  disputes: [],
  notifications: [],
};

const ProviderContext = createContext<ProviderContextValue | null>(null);

export function ProviderProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  const [data, setData] = useState<Dashboard>(empty);

  const refresh = useCallback(async () => {
    setData(await api.dashboard());
  }, []);

  useEffect(() => {
    if (!signedIn) {
      setData(empty);
      return;
    }
    refresh().catch(() => {});
    // Keep the screens current with what clients do (payments, check-ins, cancellations).
    const timer = setInterval(() => refresh().catch(() => {}), 10000);
    return () => clearInterval(timer);
  }, [signedIn, refresh]);

  const value = useMemo<ProviderContextValue>(
    () => ({
      ...data,
      refresh,
      async createVisit(input) {
        const result = await api.createVisit(input);
        setData(result);
        return result.id;
      },
      async saveSettings(input) {
        setData(await api.saveSettings(input));
      },
      async connectPayout() {
        const result = await api.connectPayout();
        return result.url;
      },
      async makeQr(id) {
        const result = await api.makeQr(id);
        await refresh();
        return { token: result.token, expiresAt: result.expiresAt };
      },
      async updateVisit(id, input) {
        setData(await api.updateVisit(id, input));
      },
      async cancelVisit(id) {
        setData(await api.cancel(id));
      },
      async reportNoShow(id, note) {
        const result = await api.noShow(id, note);
        setData(result);
        return result.id;
      },
      async raiseDispute(input) {
        const result = await api.dispute(input);
        setData(result);
        return result.id;
      },
    }),
    [data, refresh],
  );

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

export function useProvider() {
  const value = useContext(ProviderContext);
  if (!value) throw new Error('useProvider must be used inside ProviderProvider');
  return value;
}

export type { Business, Dispute, Notice, Policy, Visit };
