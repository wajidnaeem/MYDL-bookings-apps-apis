import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import type { Appointment, Dispute, Notice, Transaction } from '@/data/sample';
import { policy as fallbackPolicy } from '@/data/sample';
import { api, type Snapshot } from '@/lib/api';

export type Profile = {
  name: string;
  email: string;
  phone: string;
};

type ClientContextValue = {
  profile: Profile;
  policy: Snapshot['policy'];
  appointments: Appointment[];
  transactions: Transaction[];
  disputes: Dispute[];
  notifications: Notice[];
  updateProfile: (profile: Profile) => Promise<void>;
  declineInvitation: (id: string) => Promise<void>;
  acceptPolicy: (id: string) => Promise<void>;
  payDeposit: (id: string) => Promise<string>;
  confirmPayment: (sessionId: string) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  confirmAttendance: (id: string, code: string) => Promise<boolean>;
  reportProviderNoShow: (id: string, note: string) => Promise<string>;
  raiseDispute: (input: { title: string; detail: string; evidence?: string; evidenceFile?: { name: string; data: string }; appointmentId?: string }) => Promise<string>;
};

const emptyProfile: Profile = { name: '', email: '', phone: '' };
const ClientContext = createContext<ClientContextValue | null>(null);

function apply(snapshot: Snapshot, setters: {
  setProfile: (profile: Profile) => void;
  setPolicy: (policy: Snapshot['policy']) => void;
  setAppointments: (items: Appointment[]) => void;
  setTransactions: (items: Transaction[]) => void;
  setDisputes: (items: Dispute[]) => void;
  setNotifications: (items: Notice[]) => void;
}) {
  setters.setProfile(snapshot.profile);
  setters.setPolicy(snapshot.policy);
  setters.setAppointments(snapshot.appointments);
  setters.setTransactions(snapshot.transactions);
  setters.setDisputes(snapshot.disputes);
  setters.setNotifications(snapshot.notifications);
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [policy, setPolicy] = useState(fallbackPolicy);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [notifications, setNotifications] = useState<Notice[]>([]);

  const setters = useMemo(
    () => ({ setProfile, setPolicy, setAppointments, setTransactions, setDisputes, setNotifications }),
    [],
  );

  useEffect(() => {
    if (!signedIn) {
      setProfile(emptyProfile);
      setAppointments([]);
      setTransactions([]);
      setDisputes([]);
      setNotifications([]);
      return;
    }
    api.me().then((snapshot) => apply(snapshot, setters)).catch(() => {});
  }, [signedIn, setters]);

  const updateProfile = useCallback(async (next: Profile) => {
    apply(await api.updateProfile(next), setters);
  }, [setters]);

  const declineInvitation = useCallback(async (id: string) => {
    apply(await api.decline(id), setters);
  }, [setters]);

  const acceptPolicy = useCallback(async (id: string) => {
    apply(await api.acceptPolicy(id), setters);
  }, [setters]);

  const payDeposit = useCallback(async (id: string) => {
    const result = await api.pay(id);
    return result.url;
  }, []);

  const confirmPayment = useCallback(async (sessionId: string) => {
    apply(await api.confirmPayment(sessionId), setters);
  }, [setters]);

  const cancelAppointment = useCallback(async (id: string) => {
    apply(await api.cancel(id), setters);
  }, [setters]);

  const confirmAttendance = useCallback(async (id: string, code: string) => {
    const result = await api.attend(id, code);
    apply(result, setters);
    return result.ok;
  }, [setters]);

  const reportProviderNoShow = useCallback(async (id: string, note: string) => {
    const result = await api.noShow(id, note);
    apply(result, setters);
    return result.id;
  }, [setters]);

  const raiseDispute = useCallback(async (input: { title: string; detail: string; evidence?: string; evidenceFile?: { name: string; data: string }; appointmentId?: string }) => {
    const result = await api.dispute(input);
    apply(result, setters);
    return result.id;
  }, [setters]);

  const value = useMemo(
    () => ({
      profile,
      policy,
      appointments,
      transactions,
      disputes,
      notifications,
      updateProfile,
      declineInvitation,
      acceptPolicy,
      payDeposit,
      confirmPayment,
      cancelAppointment,
      confirmAttendance,
      reportProviderNoShow,
      raiseDispute,
    }),
    [
      profile,
      policy,
      appointments,
      transactions,
      disputes,
      notifications,
      updateProfile,
      declineInvitation,
      acceptPolicy,
      payDeposit,
      confirmPayment,
      cancelAppointment,
      confirmAttendance,
      reportProviderNoShow,
      raiseDispute,
    ],
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const value = useContext(ClientContext);
  if (!value) throw new Error('useClient must be used inside ClientProvider');
  return value;
}
