import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { Appointment, Dispute, Notice, Transaction } from '@/data/sample';

export type Snapshot = {
  profile: { name: string; email: string; phone: string };
  policy: {
    lateAfterMinutes: number;
    lateFee: string;
    noShow: string;
    cancellation: string;
  };
  appointments: Appointment[];
  transactions: Transaction[];
  disputes: Dispute[];
  notifications: Notice[];
};

let token = '';

export function apiBase() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  if (Platform.OS === 'web') return 'http://localhost:4000';
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:4000` : 'http://localhost:4000';
}

export function setToken(next: string) {
  token = next;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the MYDL server. Start it, then try again.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Something went wrong.');
  }
  return body as T;
}

export const api = {
  register: (input: { name: string; email: string; phone: string; password: string }) =>
    request<{ email: string }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  verify: (email: string, code: string) =>
    request<{ token: string }>('/auth/verify', { method: 'POST', body: JSON.stringify({ email, code }) }),
  login: (email: string, password: string) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  forgot: (email: string) =>
    request<{ email: string }>('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  reset: (email: string, code: string, password: string) =>
    request<{ ok: boolean }>('/auth/reset', { method: 'POST', body: JSON.stringify({ email, code, password }) }),
  me: () => request<Snapshot>('/me'),
  updateProfile: (profile: Snapshot['profile']) => request<Snapshot>('/me', { method: 'PATCH', body: JSON.stringify(profile) }),
  decline: (id: string) => request<Snapshot>(`/appointments/${id}/decline`, { method: 'POST' }),
  pay: (id: string) => request<Snapshot>(`/appointments/${id}/pay`, { method: 'POST' }),
  cancel: (id: string) => request<Snapshot>(`/appointments/${id}/cancel`, { method: 'POST' }),
  attend: (id: string, code: string) =>
    request<Snapshot & { ok: boolean }>(`/appointments/${id}/attend`, { method: 'POST', body: JSON.stringify({ code }) }),
  noShow: (id: string, note: string) =>
    request<Snapshot & { id: string }>(`/appointments/${id}/no-show`, { method: 'POST', body: JSON.stringify({ note }) }),
  dispute: (input: { title: string; detail: string; evidence?: string; appointmentId?: string }) =>
    request<Snapshot & { id: string }>('/disputes', { method: 'POST', body: JSON.stringify(input) }),
  registerDevice: (pushToken: string) =>
    request<{ ok: boolean }>('/devices', { method: 'POST', body: JSON.stringify({ token: pushToken }) }),
};
