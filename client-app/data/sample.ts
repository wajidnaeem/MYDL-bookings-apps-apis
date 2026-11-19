export type AppointmentStatus = 'pending' | 'upcoming' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: string;
  deposit: string;
  status: AppointmentStatus;
  depositPaid: boolean;
  attended?: boolean;
};

export type Transaction = {
  id: string;
  title: string;
  detail: string;
  amount: string;
  status: string;
};

export type Dispute = {
  id: string;
  title: string;
  detail: string;
  status: string;
  evidence?: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  time: string;
};

export const policy = {
  lateAfterMinutes: 15,
  lateFee: '$10.00',
  noShow: 'The provider may keep the full deposit if you do not attend.',
  cancellation:
    'The deposit is refunded when you cancel at least 24 hours before the appointment.',
};

export const appointments: Appointment[] = [
  {
    id: 'apt-1001',
    provider: 'North Studio',
    service: 'Consultation',
    date: 'Thu, 20 Nov 2026',
    time: '2:30 PM',
    duration: '45 min',
    location: '12 King Street',
    price: '$80.00',
    deposit: '$25.00',
    status: 'pending',
    depositPaid: false,
  },
  {
    id: 'apt-1002',
    provider: 'Harbor & Co.',
    service: 'Follow-up visit',
    date: 'Fri, 21 Nov 2026',
    time: '10:00 AM',
    duration: '30 min',
    location: '4 Market Lane',
    price: '$60.00',
    deposit: '$20.00',
    status: 'upcoming',
    depositPaid: true,
  },
  {
    id: 'apt-1003',
    provider: 'Lane Atelier',
    service: 'Style session',
    date: 'Mon, 10 Nov 2026',
    time: '4:00 PM',
    duration: '60 min',
    location: '88 River Road',
    price: '$120.00',
    deposit: '$40.00',
    status: 'completed',
    depositPaid: true,
  },
  {
    id: 'apt-1004',
    provider: 'West Room',
    service: 'Intro visit',
    date: 'Wed, 5 Nov 2026',
    time: '1:00 PM',
    duration: '30 min',
    location: '2 Oak Avenue',
    price: '$50.00',
    deposit: '$15.00',
    status: 'cancelled',
    depositPaid: true,
  },
];

export const notifications: Notice[] = [
  {
    id: 'ntf-1',
    title: 'Appointment invitation',
    body: 'North Studio invited you to a consultation on Thu, 20 Nov.',
    time: 'Today, 9:10 AM',
  },
  {
    id: 'ntf-2',
    title: 'Deposit held',
    body: 'Your $20.00 deposit for Harbor & Co. is held until the visit.',
    time: 'Yesterday',
  },
  {
    id: 'ntf-3',
    title: 'Visit cancelled',
    body: 'West Room cancelled the intro visit. A refund is in review.',
    time: '5 Nov',
  },
];

export const transactions: Transaction[] = [
  {
    id: 'txn-1',
    title: 'Deposit',
    detail: 'Harbor & Co. · Follow-up visit',
    amount: '$20.00',
    status: 'Held',
  },
  {
    id: 'txn-2',
    title: 'Refund',
    detail: 'West Room · Intro visit',
    amount: '$15.00',
    status: 'Refunded',
  },
  {
    id: 'txn-3',
    title: 'Deposit',
    detail: 'Lane Atelier · Style session',
    amount: '$40.00',
    status: 'Released',
  },
];

export const disputes: Dispute[] = [
  {
    id: 'dsp-1',
    title: 'Deposit refund',
    detail: 'You asked for the West Room deposit back after the cancellation.',
    status: 'In review',
  },
];

export function getAppointment(id: string | string[] | undefined) {
  const key = Array.isArray(id) ? id[0] : id;
  return appointments.find((item) => item.id === key);
}

export function getTransaction(id: string | string[] | undefined) {
  const key = Array.isArray(id) ? id[0] : id;
  return transactions.find((item) => item.id === key);
}

export function getDispute(id: string | string[] | undefined) {
  const key = Array.isArray(id) ? id[0] : id;
  return disputes.find((item) => item.id === key);
}
