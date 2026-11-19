import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { Business, Dashboard, Policy } from '@/lib/types';

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
  if (!response.ok) throw new Error(body.error || 'Something went wrong.');
  return body as T;
}

export const api = {
  register: (input: { name: string; email: string; phone: string; password: string }) =>
    request<{ email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...input, role: 'provider' }),
    }),
  verify: (email: string, code: string) =>
    request<{ token: string; user: { role: string } }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: { role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  forgot: (email: string) =>
    request<{ email: string }>('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  registerDevice: (pushToken: string) =>
    request<{ ok: boolean }>('/devices', { method: 'POST', body: JSON.stringify({ token: pushToken }) }),
  reset: (email: string, code: string, password: string) =>
    request('/auth/reset', { method: 'POST', body: JSON.stringify({ email, code, password }) }),
  me: () => request<{ user: { role: string } }>('/me'),
  dashboard: () => request<Dashboard>('/provider/dashboard'),
  saveSettings: (input: Partial<Business & Policy>) =>
    request<Dashboard>('/provider/settings', { method: 'PATCH', body: JSON.stringify(input) }),
  createVisit: (input: {
    clientEmail: string;
    service: string;
    date: string;
    time: string;
    duration: string;
    location: string;
    price: string;
    deposit: string;
  }) => request<Dashboard & { id: string }>('/provider/appointments', { method: 'POST', body: JSON.stringify(input) }),
  makeQr: (id: string) =>
    request<{ token: string; previewPath: string }>(`/provider/appointments/${id}/qr`, { method: 'POST' }),
  cancel: (id: string) => request<Dashboard>(`/provider/appointments/${id}/cancel`, { method: 'POST' }),
  noShow: (id: string, note: string) =>
    request<Dashboard & { id: string }>(`/provider/appointments/${id}/no-show`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),
  dispute: (input: { title: string; detail: string; appointmentId?: string }) =>
    request<Dashboard & { id: string }>('/disputes', { method: 'POST', body: JSON.stringify(input) }),
};
