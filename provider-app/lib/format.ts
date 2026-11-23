import { useEffect, useRef } from 'react';

import type { Visit } from '@/lib/types';

export function money(value: string | undefined) {
  const n = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function usd(n: number) {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/** Best-effort start time in the device clock. Used only to order visits on screen. */
export function visitStart(visit: Visit) {
  const date = String(visit.date || '').replace(/^[A-Za-z]+,\s*/, '');
  const ts = Date.parse(`${date} ${visit.time}`);
  return Number.isNaN(ts) ? null : ts;
}

export function byStart(a: Visit, b: Visit) {
  return (visitStart(a) ?? Infinity) - (visitStart(b) ?? Infinity);
}

/** Same rule the Earnings screen has always used. */
export function depositStatus(visit: Visit) {
  if (visit.depositOutcome === 'kept') return 'Kept';
  if (visit.status === 'cancelled') return 'Refunded';
  if (visit.attended) return 'Released';
  return 'Held';
}

export function visitLabel(status: Visit['status']) {
  return status === 'pending' ? 'Invitation' : status;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function todayLabel(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}


/** Fills a form once its data has loaded (e.g. after a page refresh on web). */
export function useFillOnce(ready: boolean, fill: () => void) {
  const done = useRef(false);
  useEffect(() => {
    if (ready && !done.current) {
      done.current = true;
      fill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}
