export type VisitStatus = 'pending' | 'upcoming' | 'completed' | 'cancelled';

export type Visit = {
  id: string;
  provider: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: string;
  deposit: string;
  status: VisitStatus;
  depositPaid: boolean;
  attended?: boolean;
  clientName: string;
  clientEmail: string;
  hasQr?: boolean;
  depositOutcome?: 'refunded' | 'kept' | null;
};

export type Business = {
  businessName: string;
  serviceDetails: string;
  location: string;
  contact: string;
  payoutMethod: string;
  payoutDetails: string;
};

export type Policy = {
  lateAfterMinutes: number;
  lateFee: string;
  noShow: string;
  cancellation: string;
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

export type Dashboard = {
  profile: { name: string; email: string; phone: string };
  business: Business;
  policy: Policy;
  appointments: Visit[];
  disputes: Dispute[];
  notifications: Notice[];
};
