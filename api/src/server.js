import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import Stripe from 'stripe';

const PORT = Number(process.env.PORT || 4000);
const SECRET = process.env.MYDL_SECRET || 'mydl-dev-secret-change-me';
const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'mydl.sqlite'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    verify_code TEXT,
    reset_code TEXT
  );
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    provider_id TEXT,
    provider_name TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT NOT NULL,
    deposit TEXT NOT NULL,
    status TEXT NOT NULL,
    deposit_paid INTEGER NOT NULL DEFAULT 0,
    attended INTEGER NOT NULL DEFAULT 0,
    qr_token TEXT,
    qr_expires_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    appointment_id TEXT,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    evidence TEXT,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS push_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS provider_settings (
    user_id TEXT PRIMARY KEY,
    business_name TEXT,
    service_details TEXT,
    location TEXT,
    contact TEXT,
    payout_method TEXT,
    payout_details TEXT,
    late_after_minutes INTEGER,
    late_fee TEXT,
    no_show_rule TEXT,
    cancellation_rule TEXT
  );
`);

function addColumn(table, column, type) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}
addColumn('appointments', 'deposit_outcome', 'TEXT');
addColumn('appointments', 'stripe_session_id', 'TEXT');
addColumn('appointments', 'stripe_payment_intent', 'TEXT');
addColumn('appointments', 'stripe_payment_method', 'TEXT');
addColumn('appointments', 'timezone', 'TEXT');
addColumn('appointments', 'policy_accepted_at', 'INTEGER');
addColumn('appointments', 'reminded', 'INTEGER');
addColumn('users', 'stripe_customer_id', 'TEXT');
addColumn('provider_settings', 'stripe_account_id', 'TEXT');
db.exec(`CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at INTEGER NOT NULL
)`);
fs.mkdirSync(path.join(dataDir, 'evidence'), { recursive: true });

const policy = {
  lateAfterMinutes: 15,
  lateFee: '$10.00',
  noShow: 'The provider may keep the full deposit if you do not attend.',
  cancellation: 'The deposit is refunded when you cancel at least 24 hours before the appointment.',
};

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@mydl.app';

function mailer() {
  if (!process.env.SMTP_HOST) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
      : undefined,
  });
}

async function sendCodeEmail(to, subject, intro, code) {
  const text = `${intro}\n\nYour MYDL code is ${code}.\n\nIf you did not ask for this, you can ignore this email.`;
  const transport = mailer();
  if (!transport) {
    console.log(`MYDL email (set SMTP_HOST to send it) to ${to}: ${subject} — code ${code}`);
    return;
  }
  await transport.sendMail({ from: mailFrom, to, subject, text });
}

function appointmentStart(row) {
  const date = String(row.date || '').replace(/^[A-Za-z]+,\s*/, '');
  const time = String(row.time || '').trim();
  const zone = row.timezone || 'UTC';
  const utcGuess = Date.parse(`${date} ${time} UTC`);
  if (Number.isNaN(utcGuess)) return null;
  try {
    const asZone = new Date(new Date(utcGuess).toLocaleString('en-US', { timeZone: zone }));
    const asUtc = new Date(new Date(utcGuess).toLocaleString('en-US', { timeZone: 'UTC' }));
    return utcGuess + (asUtc.getTime() - asZone.getTime());
  } catch {
    return Date.parse(`${date} ${time}`);
  }
}

function audit(actorId, action, detail) {
  db.prepare('INSERT INTO audit_log (id, actor_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?)').run(
    crypto.randomUUID(), actorId || null, action, detail, Date.now(),
  );
}

function keepDeposit(row) {
  if (!row.deposit_paid || row.deposit_outcome === 'refunded' || row.deposit_outcome === 'kept') return;
  const detail = `${row.provider_name} · ${row.service}`;
  db.prepare("UPDATE appointments SET deposit_outcome = 'kept' WHERE id = ?").run(row.id);
  if (row.client_id) {
    const held = db.prepare("SELECT id FROM transactions WHERE user_id = ? AND title = 'Deposit' AND detail = ? AND status = 'Held' ORDER BY created_at DESC LIMIT 1").get(row.client_id, detail);
    if (held) db.prepare("UPDATE transactions SET status = 'Kept' WHERE id = ?").run(held.id);
    else insertTransaction(row.client_id, 'Deposit kept', detail, row.deposit, 'Kept');
  }
}

function saveEvidence(file) {
  if (!file || typeof file !== 'object' || !file.data) return null;
  const safe = String(file.name || 'evidence').replace(/[^a-zA-Z0-9._-]/g, '') || 'evidence';
  const filename = `${crypto.randomUUID()}-${safe}`;
  fs.writeFileSync(path.join(dataDir, 'evidence', filename), Buffer.from(String(file.data), 'base64'));
  return `/evidence/${filename}`;
}

function rulesFor(providerId) {
  const settings = providerId
    ? db.prepare('SELECT * FROM provider_settings WHERE user_id = ?').get(providerId)
    : null;
  return {
    lateAfterMinutes: Number(settings?.late_after_minutes ?? policy.lateAfterMinutes) || policy.lateAfterMinutes,
    lateFee: settings?.late_fee || policy.lateFee,
    noShow: settings?.no_show_rule || policy.noShow,
    cancellation: settings?.cancellation_rule || policy.cancellation,
  };
}

function feeAmount(amount) {
  const value = Number(String(amount || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function clientKeepsRefund(row) {
  const start = appointmentStart(row);
  if (start == null) return true;
  return start - Date.now() >= CANCEL_WINDOW_MS;
}

function insertTransaction(userId, title, detail, amount, status) {
  db.prepare('INSERT INTO transactions (id, user_id, title, detail, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    crypto.randomUUID(), userId, title, detail, amount, status, Date.now(),
  );
}

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function requireStripe() {
  const client = stripeClient();
  if (!client) {
    const error = new Error('Add STRIPE_SECRET_KEY to api/.env, then restart the API.');
    error.status = 503;
    throw error;
  }
  return client;
}

function moneyToCents(amount) {
  const cents = Math.round(feeAmount(amount) * 100);
  if (cents < 50) {
    const error = new Error('The amount must be at least $0.50.');
    error.status = 400;
    throw error;
  }
  return cents;
}

function appUrl(name, fallback) {
  return String(process.env[name] || fallback).replace(/\/$/, '');
}

async function stripeCustomer(user) {
  if (user.stripe_customer_id) return user.stripe_customer_id;
  const customer = await requireStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customer.id, user.id);
  return customer.id;
}

async function refundStripeDeposit(row) {
  const client = stripeClient();
  if (!client || !row.stripe_payment_intent) return;
  const existing = await client.refunds.list({ payment_intent: row.stripe_payment_intent, limit: 1 });
  if (existing.data.length) return;
  await client.refunds.create({ payment_intent: row.stripe_payment_intent });
}

async function releaseStripeDeposit(row) {
  const detail = `${row.provider_name} · ${row.service}`;
  if (row.client_id) {
    const held = db.prepare("SELECT id FROM transactions WHERE user_id = ? AND title = 'Deposit' AND detail = ? AND status = 'Held' ORDER BY created_at DESC LIMIT 1").get(row.client_id, detail);
    if (held) db.prepare("UPDATE transactions SET status = 'Released' WHERE id = ?").run(held.id);
  }
  if (row.deposit_outcome !== 'refunded' && row.deposit_outcome !== 'kept') {
    db.prepare("UPDATE appointments SET deposit_outcome = 'released' WHERE id = ?").run(row.id);
  }
  const client = stripeClient();
  const settings = row.provider_id
    ? db.prepare('SELECT stripe_account_id FROM provider_settings WHERE user_id = ?').get(row.provider_id)
    : null;
  if (!client || !row.stripe_payment_intent || !settings?.stripe_account_id) return;
  const intent = await client.paymentIntents.retrieve(row.stripe_payment_intent);
  const chargeId = typeof intent.latest_charge === 'string' ? intent.latest_charge : intent.latest_charge?.id;
  if (!chargeId) return;
  await client.transfers.create({
    amount: moneyToCents(row.deposit),
    currency: 'usd',
    destination: settings.stripe_account_id,
    source_transaction: chargeId,
  });
}

function markDepositPaid(row, paymentIntentId) {
  db.prepare("UPDATE appointments SET status = 'upcoming', deposit_paid = 1, stripe_payment_intent = ? WHERE id = ?").run(paymentIntentId || row.stripe_payment_intent, row.id);
  insertTransaction(row.client_id, 'Deposit', `${row.provider_name} · ${row.service}`, row.deposit, 'Held');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const next = crypto.scryptSync(password, salt, 32);
  const current = Buffer.from(hash, 'hex');
  if (next.length !== current.length) return false;
  return crypto.timingSafeEqual(next, current);
}

function signToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ sub: user.id, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }),
  ).toString('base64url');
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function readToken(header) {
  const raw = String(header || '').replace(/^Bearer\s+/i, '');
  const [h, b, s] = raw.split('.');
  if (!h || !b || !s) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(`${h}.${b}`).digest('base64url');
  const a = Buffer.from(s);
  const c = Buffer.from(expected);
  if (a.length !== c.length || !crypto.timingSafeEqual(a, c)) return null;
  const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
  if (payload.exp < Date.now()) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) || null;
}

function publicUser(user) {
  return { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone, verified: Boolean(user.verified) };
}

function mapAppointment(row) {
  return {
    id: row.id,
    provider: row.provider_name,
    service: row.service,
    date: row.date,
    time: row.time,
    timezone: row.timezone || 'UTC',
    duration: row.duration,
    location: row.location,
    price: row.price,
    deposit: row.deposit,
    status: row.status,
    depositPaid: Boolean(row.deposit_paid),
    attended: Boolean(row.attended),
    policyAccepted: Boolean(row.policy_accepted_at),
  };
}

function when(ts) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  return new Date(ts).toLocaleString();
}

function snapshot(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const linked = db.prepare('SELECT provider_id FROM appointments WHERE client_id = ? AND provider_id IS NOT NULL LIMIT 1').get(userId);
  return {
    profile: { name: user.name, email: user.email, phone: user.phone },
    policy: rulesFor(linked?.provider_id),
    appointments: db.prepare('SELECT * FROM appointments WHERE client_id = ? ORDER BY date').all(userId).map(mapAppointment),
    transactions: db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(userId).map((row) => ({
      id: row.id, title: row.title, detail: row.detail, amount: row.amount, status: row.status,
    })),
    disputes: db.prepare('SELECT * FROM disputes WHERE user_id = ? ORDER BY created_at DESC').all(userId).map((row) => ({
      id: row.id, title: row.title, detail: row.detail, status: row.status, evidence: row.evidence || undefined,
    })),
    notifications: db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId).map((row) => ({
      id: row.id, title: row.title, body: row.body, time: when(row.created_at),
    })),
  };
}

async function notify(userId, title, body) {
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO notifications (id, user_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)').run(id, userId, title, body, Date.now());
  const tokens = db.prepare('SELECT token FROM push_tokens WHERE user_id = ?').all(userId);
  if (!tokens.length) return;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(tokens.map((row) => ({ to: row.token, title, body, sound: 'default' }))),
  }).catch(() => {});
}

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count) return;
  const clientId = crypto.randomUUID();
  const providerId = crypto.randomUUID();
  const adminId = crypto.randomUUID();
  const password = hashPassword('password');
  const insertUser = db.prepare('INSERT INTO users (id, role, name, email, phone, password_hash, verified) VALUES (?, ?, ?, ?, ?, ?, 1)');
  insertUser.run(clientId, 'client', 'Amina Khan', 'amina@example.com', '+1 202 555 0148', password);
  insertUser.run(providerId, 'provider', 'Harbor & Co.', 'provider@mydl.app', '+1 202 555 0199', password);
  insertUser.run(adminId, 'admin', 'MYDL Admin', 'admin@mydl.app', '+1 202 555 0100', password);

  const visits = [
    ['apt-1001', 'North Studio', 'Consultation', 'Thu, 20 Nov 2026', '2:30 PM', '45 min', '12 King Street', '$80.00', '$25.00', 'pending', 0, null],
    ['apt-1002', 'Harbor & Co.', 'Follow-up visit', 'Fri, 21 Nov 2026', '10:00 AM', '30 min', '4 Market Lane', '$60.00', '$20.00', 'upcoming', 1, 'MYDL-HARBOR'],
    ['apt-1003', 'Lane Atelier', 'Style session', 'Mon, 10 Nov 2026', '4:00 PM', '60 min', '88 River Road', '$120.00', '$40.00', 'completed', 1, null],
    ['apt-1004', 'West Room', 'Intro visit', 'Wed, 5 Nov 2026', '1:00 PM', '30 min', '2 Oak Avenue', '$50.00', '$15.00', 'cancelled', 1, null],
  ];
  const insertVisit = db.prepare(`INSERT INTO appointments
    (id, client_id, provider_id, provider_name, service, date, time, duration, location, price, deposit, status, deposit_paid, attended, qr_token, qr_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`);
  for (const visit of visits) {
    insertVisit.run(visit[0], clientId, providerId, visit[1], visit[2], visit[3], visit[4], visit[5], visit[6], visit[7], visit[8], visit[9], visit[10], visit[11], visit[11] ? Date.now() + 1000 * 60 * 60 * 24 * 365 : null);
  }
  const insertTxn = db.prepare('INSERT INTO transactions (id, user_id, title, detail, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertTxn.run('txn-1', clientId, 'Deposit', 'Harbor & Co. · Follow-up visit', '$20.00', 'Held', Date.now() - 86_400_000);
  insertTxn.run('txn-2', clientId, 'Refund', 'West Room · Intro visit', '$15.00', 'Refunded', Date.now() - 86_400_000 * 5);
  insertTxn.run('txn-3', clientId, 'Deposit', 'Lane Atelier · Style session', '$40.00', 'Released', Date.now() - 86_400_000 * 8);
  db.prepare('INSERT INTO disputes (id, user_id, appointment_id, title, detail, evidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    'dsp-1', clientId, 'apt-1004', 'Deposit refund', 'You asked for the West Room deposit back after the cancellation.', null, 'In review', Date.now() - 86_400_000 * 4,
  );
  db.prepare('INSERT INTO notifications (id, user_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)').run(
    'ntf-1', clientId, 'Appointment invitation', 'North Studio invited you to a consultation on Thu, 20 Nov.', Date.now() - 3_600_000,
  );
}

seed();
ensureProviderSettings();

function ensureProviderSettings() {
  const provider = db.prepare("SELECT * FROM users WHERE role = 'provider'").get();
  if (!provider) return;
  const existing = db.prepare('SELECT user_id FROM provider_settings WHERE user_id = ?').get(provider.id);
  if (existing) return;
  db.prepare(`INSERT INTO provider_settings
    (user_id, business_name, service_details, location, contact, payout_method, payout_details, late_after_minutes, late_fee, no_show_rule, cancellation_rule)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    provider.id,
    'Harbor & Co.',
    'Follow-up visits and consultations',
    '4 Market Lane',
    provider.phone,
    'Bank transfer',
    'Account ending 4421',
    15,
    '$10.00',
    policy.noShow,
    policy.cancellation,
  );
}

function providerSnapshot(user) {
  const settings = db.prepare('SELECT * FROM provider_settings WHERE user_id = ?').get(user.id) || {};
  const appointments = db.prepare(`
    SELECT a.*, c.name AS client_name, c.email AS client_email
    FROM appointments a
    LEFT JOIN users c ON c.id = a.client_id
    WHERE a.provider_id = ?
  `).all(user.id).map((row) => ({
    ...mapAppointment(row),
    clientName: row.client_name || '',
    clientEmail: row.client_email || '',
    hasQr: Boolean(row.qr_token && row.qr_expires_at > Date.now()),
    depositOutcome: row.deposit_outcome || null,
  }));
  return {
    profile: { name: user.name, email: user.email, phone: user.phone },
    business: {
      businessName: settings.business_name || user.name,
      serviceDetails: settings.service_details || '',
      location: settings.location || '',
      contact: settings.contact || user.phone,
      payoutMethod: settings.payout_method || '',
      payoutDetails: settings.payout_details || '',
      payoutConnected: Boolean(settings.stripe_account_id),
    },
    policy: {
      lateAfterMinutes: settings.late_after_minutes ?? 15,
      lateFee: settings.late_fee || '$10.00',
      noShow: settings.no_show_rule || policy.noShow,
      cancellation: settings.cancellation_rule || policy.cancellation,
    },
    appointments,
    disputes: db.prepare('SELECT * FROM disputes WHERE user_id = ? ORDER BY created_at DESC').all(user.id).map((row) => ({
      id: row.id, title: row.title, detail: row.detail, status: row.status, evidence: row.evidence || undefined,
    })),
    notifications: db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(user.id).map((row) => ({
      id: row.id, title: row.title, body: row.body, time: when(row.created_at),
    })),
  };
}

function requireUser(req, res) {
  const user = readToken(req.headers.authorization);
  if (!user) {
    send(res, 401, { error: 'Sign in again.' });
    return null;
  }
  return user;
}

function requireRole(user, res, role) {
  if (user.role !== role) {
    send(res, 403, { error: 'You do not have access to this.' });
    return false;
  }
  return true;
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString());
}

function ownAppointment(user, id) {
  return db.prepare('SELECT * FROM appointments WHERE id = ? AND client_id = ?').get(id, user.id);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  try {
    if (req.method === 'POST' && url.pathname === '/auth/register') {
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const password = String(body.password || '');
      const role = body.role === 'provider' ? 'provider' : 'client';
      if (!name || !email.includes('@') || !phone || password.length < 6) {
        send(res, 400, { error: 'Enter your name, email, phone, and a password of at least 6 characters.' });
        return;
      }
      if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
        send(res, 409, { error: 'An account with this email already exists.' });
        return;
      }
      const code = String(crypto.randomInt(1000, 10000));
      const id = crypto.randomUUID();
      db.prepare('INSERT INTO users (id, role, name, email, phone, password_hash, verified, verify_code) VALUES (?, ?, ?, ?, ?, ?, 0, ?)').run(
        id, role, name, email, phone, hashPassword(password), code,
      );
      try {
        await sendCodeEmail(email, 'Your MYDL verification code', `Hello ${name}, use this code to verify your MYDL account.`, code);
      } catch {
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        send(res, 502, { error: 'The verification email could not be sent. Try again.' });
        return;
      }
      send(res, 201, { email });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/verify') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user || user.verify_code !== String(body.code || '').trim()) {
        send(res, 400, { error: 'That verification code is not valid.' });
        return;
      }
      db.prepare('UPDATE users SET verified = 1, verify_code = NULL WHERE id = ?').run(user.id);
      user.verified = 1;
      send(res, 200, { token: signToken(user), user: publicUser(user) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user || !checkPassword(String(body.password || ''), user.password_hash)) {
        send(res, 401, { error: 'Email or password is incorrect.' });
        return;
      }
      if (!user.verified) {
        send(res, 403, { error: 'Verify your account before signing in.' });
        return;
      }
      send(res, 200, { token: signToken(user), user: publicUser(user) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/forgot') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        send(res, 200, { email });
        return;
      }
      const code = String(crypto.randomInt(1000, 10000));
      db.prepare('UPDATE users SET reset_code = ? WHERE id = ?').run(code, user.id);
      try {
        await sendCodeEmail(email, 'Your MYDL reset code', 'Use this code to choose a new MYDL password.', code);
      } catch {
        db.prepare('UPDATE users SET reset_code = NULL WHERE id = ?').run(user.id);
        send(res, 502, { error: 'The reset email could not be sent. Try again.' });
        return;
      }
      send(res, 200, { email });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/reset') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user || user.reset_code !== String(body.code || '').trim()) {
        send(res, 400, { error: 'That reset code is not valid.' });
        return;
      }
      if (password.length < 6) {
        send(res, 400, { error: 'Use at least 6 characters.' });
        return;
      }
      db.prepare('UPDATE users SET password_hash = ?, reset_code = NULL WHERE id = ?').run(hashPassword(password), user.id);
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && parts[0] === 'demo' && parts[1] === 'qr' && parts[2]?.endsWith('.png')) {
      const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(parts[2].slice(0, -4));
      if (!row?.qr_token) {
        send(res, 404, { error: 'This visit has no QR code yet.' });
        return;
      }
      const png = await QRCode.toBuffer(row.qr_token, { width: 320, margin: 1 });
      res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });
      res.end(png);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(root, '..', 'public', 'admin.html')));
      return;
    }

    if (req.method === 'GET' && parts[0] === 'demo' && parts[1] === 'qr' && parts[2]) {
      const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(parts[2]);
      if (!row?.qr_token) {
        send(res, 404, { error: 'This visit has no QR code yet.' });
        return;
      }
      const png = await QRCode.toBuffer(row.qr_token, { width: 320, margin: 1 });
      const page = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>MYDL QR</title><body style="font-family:sans-serif;text-align:center;padding:24px"><h1>${row.provider_name}</h1><p>Scan this code in the MYDL client app.</p><img alt="Attendance QR" src="data:image/png;base64,${png.toString('base64')}"></body>`;
      send(res, 200, page, 'text/html; charset=utf-8');
      return;
    }

    const user = requireUser(req, res);
    if (!user) return;

    if (req.method === 'GET' && url.pathname === '/me') {
      send(res, 200, { user: publicUser(user), ...snapshot(user.id) });
      return;
    }

    if (req.method === 'PATCH' && url.pathname === '/me') {
      const body = await readBody(req);
      const name = String(body.name || user.name).trim();
      const phone = String(body.phone || user.phone).trim();
      const email = String(body.email || user.email).trim().toLowerCase();
      if (!name || !phone || !email.includes('@')) {
        send(res, 400, { error: 'Name, email, and phone are required.' });
        return;
      }
      const taken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id);
      if (taken) {
        send(res, 409, { error: 'That email is already in use.' });
        return;
      }
      db.prepare('UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?').run(name, phone, email, user.id);
      send(res, 200, snapshot(user.id));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/devices') {
      const body = await readBody(req);
      const token = String(body.token || '').trim();
      if (!token.startsWith('ExponentPushToken') && !token.startsWith('ExpoPushToken')) {
        send(res, 400, { error: 'A device push token is required.' });
        return;
      }
      db.prepare('INSERT INTO push_tokens (token, user_id) VALUES (?, ?) ON CONFLICT(token) DO UPDATE SET user_id = excluded.user_id').run(token, user.id);
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'decline') {
      const row = ownAppointment(user, parts[1]);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(row.id);
      await notify(user.id, 'Invitation declined', 'You declined the appointment invitation.');
      send(res, 200, snapshot(user.id));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'accept-policy') {
      const row = ownAppointment(user, parts[1]);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      db.prepare('UPDATE appointments SET policy_accepted_at = ? WHERE id = ?').run(Date.now(), row.id);
      audit(user.id, 'policy-accepted', row.service);
      send(res, 200, snapshot(user.id));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'checkout') {
      const row = ownAppointment(user, parts[1]);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      if (row.deposit_paid) return send(res, 409, { error: 'This deposit is already paid.' });
      if (!row.policy_accepted_at) return send(res, 400, { error: 'Accept the visit terms before paying.' });
      const stripe = requireStripe();
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: await stripeCustomer(user),
        client_reference_id: row.id,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: moneyToCents(row.deposit),
            product_data: { name: `${row.provider_name} deposit · ${row.service}` },
          },
        }],
        success_url: `${appUrl('CLIENT_APP_URL', 'http://localhost:8081')}/payment-result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl('CLIENT_APP_URL', 'http://localhost:8081')}/checkout/${row.id}`,
        metadata: { appointmentId: row.id },
        payment_intent_data: { setup_future_usage: 'off_session', metadata: { appointmentId: row.id } },
      });
      db.prepare('UPDATE appointments SET stripe_session_id = ? WHERE id = ?').run(session.id, row.id);
      send(res, 200, { url: session.url });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/payments/confirm') {
      const body = await readBody(req);
      const stripe = requireStripe();
      const session = await stripe.checkout.sessions.retrieve(String(body.sessionId || ''));
      if (session.payment_status !== 'paid') return send(res, 402, { error: 'The card payment is not complete.' });
      const row = ownAppointment(user, session.client_reference_id);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      if (!row.deposit_paid) {
        markDepositPaid(row, paymentIntentId);
        if (paymentIntentId) {
          const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const methodId = typeof intent.payment_method === 'string' ? intent.payment_method : intent.payment_method?.id;
          if (methodId) db.prepare('UPDATE appointments SET stripe_payment_method = ? WHERE id = ?').run(methodId, row.id);
        }
        audit(user.id, 'deposit-paid', `${row.deposit} for ${row.service}`);
        await notify(user.id, 'Deposit held', `${row.deposit} for ${row.provider_name} is held until the visit.`);
        if (row.provider_id) await notify(row.provider_id, 'Deposit received', `${row.deposit} from a client is held for ${row.service}.`);
      }
      send(res, 200, snapshot(user.id));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'pay') {
      send(res, 400, { error: 'Pay the deposit through card checkout.' });
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'cancel') {
      const row = ownAppointment(user, parts[1]);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      if (row.status !== 'cancelled') {
        const detail = `${row.provider_name} · ${row.service}`;
        const refund = !row.deposit_paid || clientKeepsRefund(row);
        db.prepare('UPDATE appointments SET status = ?, deposit_outcome = ? WHERE id = ?').run(
          'cancelled',
          row.deposit_paid ? (refund ? 'refunded' : 'kept') : null,
          row.id,
        );
        let message = 'The appointment was cancelled.';
        if (row.deposit_paid && refund) {
          await refundStripeDeposit(row);
          insertTransaction(user.id, 'Refund', detail, row.deposit, 'Refunded');
          message = `The ${row.deposit} deposit is refunded.`;
        } else if (row.deposit_paid) {
          const held = db.prepare("SELECT id FROM transactions WHERE user_id = ? AND title = 'Deposit' AND detail = ? AND status = 'Held' ORDER BY created_at DESC LIMIT 1").get(user.id, detail);
          if (held) db.prepare("UPDATE transactions SET status = 'Kept' WHERE id = ?").run(held.id);
          else insertTransaction(user.id, 'Deposit kept', detail, row.deposit, 'Kept');
          message = `The ${row.deposit} deposit is kept because this is inside 24 hours of the visit.`;
        }
        await notify(user.id, 'Appointment cancelled', message);
        if (row.provider_id) await notify(row.provider_id, 'Appointment cancelled', `${user.name} cancelled ${row.service}. ${message}`);
      }
      send(res, 200, snapshot(user.id));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'attend') {
      const row = ownAppointment(user, parts[1]);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      const body = await readBody(req);
      const code = String(body.code || '').trim();
      const expired = !row.qr_expires_at || row.qr_expires_at < Date.now();
      const matches = row.qr_token && code === row.qr_token && !expired;
      if (!matches) {
        send(res, 200, { ok: false, ...snapshot(user.id) });
        return;
      }
      db.prepare("UPDATE appointments SET attended = 1, status = 'completed', qr_token = NULL WHERE id = ?").run(row.id);
      try {
        await releaseStripeDeposit(row);
      } catch (releaseError) {
        await notify(row.provider_id || user.id, 'Payout pending', releaseError instanceof Error ? releaseError.message : 'The deposit is released in MYDL, but the bank transfer is still pending.');
      }
      const rules = rulesFor(row.provider_id);
      const start = appointmentStart(row);
      const late = start != null && Date.now() >= start + rules.lateAfterMinutes * 60 * 1000 && feeAmount(rules.lateFee) > 0;
      if (late) {
        let charged = false;
        const fresh = db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.id);
        const customerId = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(user.id)?.stripe_customer_id;
        const stripe = stripeClient();
        if (stripe && fresh.stripe_payment_method && customerId) {
          try {
            await stripe.paymentIntents.create({
              amount: moneyToCents(rules.lateFee),
              currency: 'usd',
              customer: customerId,
              payment_method: fresh.stripe_payment_method,
              off_session: true,
              confirm: true,
              description: `Late fee · ${row.service}`,
            });
            charged = true;
          } catch (chargeError) {
            audit(user.id, 'late-fee-failed', chargeError instanceof Error ? chargeError.message : 'Late fee charge failed');
          }
        }
        insertTransaction(user.id, 'Late fee', `${row.provider_name} · ${row.service}`, rules.lateFee, charged ? 'Charged' : 'Due');
        audit(user.id, 'late-fee', `${rules.lateFee} ${charged ? 'charged' : 'due'} for ${row.service}`);
        if (row.provider_id) await notify(row.provider_id, 'Late fee', `A late fee of ${rules.lateFee} ${charged ? 'was charged' : 'is due'} for ${row.service}.`);
      }
      await notify(user.id, 'Attendance confirmed', late
        ? `Your visit with ${row.provider_name} is confirmed. A late fee of ${rules.lateFee} applies.`
        : `Your visit with ${row.provider_name} is confirmed.`);
      send(res, 200, { ok: true, ...snapshot(user.id) });
      return;
    }

    if (req.method === 'POST' && parts[0] === 'appointments' && parts[2] === 'no-show') {
      const row = ownAppointment(user, parts[1]);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      const body = await readBody(req);
      const id = crypto.randomUUID();
      const detail = String(body.note || '').trim() || `You reported that ${row.provider_name} did not attend.`;
      db.prepare('INSERT INTO disputes (id, user_id, appointment_id, title, detail, evidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, user.id, row.id, 'Provider no-show', detail, null, 'In review', Date.now(),
      );
      await notify(user.id, 'No-show reported', 'An administrator will review the claim.');
      send(res, 201, { id, ...snapshot(user.id) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/disputes') {
      const body = await readBody(req);
      const detail = String(body.detail || '').trim();
      if (detail.length < 8) {
        send(res, 400, { error: 'Describe the issue in a sentence or two.' });
        return;
      }
      const evidence = saveEvidence(body.evidenceFile) || String(body.evidence || '').trim() || null;
      const id = crypto.randomUUID();
      db.prepare('INSERT INTO disputes (id, user_id, appointment_id, title, detail, evidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, user.id, body.appointmentId || null, String(body.title || 'Dispute').trim(), detail, evidence, 'In review', Date.now(),
      );
      audit(user.id, 'dispute-opened', String(body.title || 'Dispute'));
      await notify(user.id, 'Dispute opened', 'You can track the decision in Disputes.');
      const payload = user.role === 'provider' ? providerSnapshot(user) : snapshot(user.id);
      send(res, 201, { id, ...payload });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/provider/appointments') {
      if (!requireRole(user, res, 'provider')) return;
      const body = await readBody(req);
      const client = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(String(body.clientEmail || '').trim().toLowerCase(), 'client');
      if (!client) {
        send(res, 404, { error: 'No client account uses that email.' });
        return;
      }
      const settings = db.prepare('SELECT * FROM provider_settings WHERE user_id = ?').get(user.id);
      const id = crypto.randomUUID();
      db.prepare(`INSERT INTO appointments
        (id, client_id, provider_id, provider_name, service, date, time, timezone, duration, location, price, deposit, status, deposit_paid, attended)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0)`).run(
        id, client.id, user.id, settings?.business_name || user.name, String(body.service || 'Appointment'), String(body.date || ''), String(body.time || ''), String(body.timezone || 'UTC'), String(body.duration || '30 min'), String(body.location || settings?.location || ''), String(body.price || '$0.00'), String(body.deposit || '$0.00'),
      );
      await notify(client.id, 'Appointment invitation', `${user.name} invited you to ${body.service || 'an appointment'}.`);
      const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      send(res, 201, { id, ...providerSnapshot(fresh) });
      return;
    }

    if (req.method === 'PATCH' && parts[0] === 'provider' && parts[1] === 'appointments' && parts.length === 3) {
      if (!requireRole(user, res, 'provider')) return;
      const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND provider_id = ?').get(parts[2], user.id);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      if (row.status === 'completed' || row.status === 'cancelled') return send(res, 400, { error: 'This visit can no longer be edited.' });
      const body = await readBody(req);
      db.prepare(`UPDATE appointments SET service = ?, date = ?, time = ?, timezone = ?, duration = ?, location = ?, price = ?, deposit = ?, reminded = 0 WHERE id = ?`).run(
        String(body.service || row.service),
        String(body.date || row.date),
        String(body.time || row.time),
        String(body.timezone || row.timezone || 'UTC'),
        String(body.duration || row.duration),
        String(body.location || row.location),
        String(body.price || row.price),
        String(body.deposit || row.deposit),
        row.id,
      );
      if (row.client_id) await notify(row.client_id, 'Visit updated', `${user.name} updated ${body.service || row.service}.`);
      audit(user.id, 'visit-updated', row.id);
      send(res, 200, providerSnapshot(user));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'provider' && parts[1] === 'appointments' && parts[3] === 'qr') {
      if (!requireRole(user, res, 'provider')) return;
      const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND provider_id = ?').get(parts[2], user.id);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      const token = `MYDL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const expiresAt = Date.now() + 1000 * 60 * 10;
      db.prepare('UPDATE appointments SET qr_token = ?, qr_expires_at = ? WHERE id = ?').run(token, expiresAt, row.id);
      send(res, 200, { token, expiresAt, previewPath: `/demo/qr/${row.id}` });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/provider/payout-link') {
      if (!requireRole(user, res, 'provider')) return;
      const stripe = requireStripe();
      const settings = db.prepare('SELECT * FROM provider_settings WHERE user_id = ?').get(user.id);
      let accountId = settings?.stripe_account_id;
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: process.env.STRIPE_CONNECT_COUNTRY || 'US',
          email: user.email,
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
          business_profile: { name: settings?.business_name || user.name },
        });
        accountId = account.id;
        if (settings) db.prepare('UPDATE provider_settings SET stripe_account_id = ? WHERE user_id = ?').run(accountId, user.id);
        else db.prepare('INSERT INTO provider_settings (user_id, business_name, stripe_account_id) VALUES (?, ?, ?)').run(user.id, user.name, accountId);
      }
      const link = await stripe.accountLinks.create({
        account: accountId,
        type: 'account_onboarding',
        refresh_url: `${appUrl('PROVIDER_APP_URL', 'http://localhost:8082')}/payout`,
        return_url: `${appUrl('PROVIDER_APP_URL', 'http://localhost:8082')}/payout`,
      });
      send(res, 200, { url: link.url });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/provider/dashboard') {
      if (!requireRole(user, res, 'provider')) return;
      send(res, 200, providerSnapshot(user));
      return;
    }

    if (req.method === 'PATCH' && url.pathname === '/provider/settings') {
      if (!requireRole(user, res, 'provider')) return;
      const body = await readBody(req);
      const current = db.prepare('SELECT * FROM provider_settings WHERE user_id = ?').get(user.id) || {};
      const next = {
        business_name: body.businessName ?? current.business_name ?? user.name,
        service_details: body.serviceDetails ?? current.service_details ?? '',
        location: body.location ?? current.location ?? '',
        contact: body.contact ?? current.contact ?? user.phone,
        payout_method: body.payoutMethod ?? current.payout_method ?? '',
        payout_details: body.payoutDetails ?? current.payout_details ?? '',
        late_after_minutes: Number(body.lateAfterMinutes ?? current.late_after_minutes ?? 15),
        late_fee: body.lateFee ?? current.late_fee ?? '$10.00',
        no_show_rule: body.noShow ?? current.no_show_rule ?? policy.noShow,
        cancellation_rule: body.cancellation ?? current.cancellation_rule ?? policy.cancellation,
      };
      db.prepare(`INSERT INTO provider_settings
        (user_id, business_name, service_details, location, contact, payout_method, payout_details, late_after_minutes, late_fee, no_show_rule, cancellation_rule)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          business_name = excluded.business_name,
          service_details = excluded.service_details,
          location = excluded.location,
          contact = excluded.contact,
          payout_method = excluded.payout_method,
          payout_details = excluded.payout_details,
          late_after_minutes = excluded.late_after_minutes,
          late_fee = excluded.late_fee,
          no_show_rule = excluded.no_show_rule,
          cancellation_rule = excluded.cancellation_rule`).run(
        user.id, next.business_name, next.service_details, next.location, next.contact, next.payout_method, next.payout_details, next.late_after_minutes, next.late_fee, next.no_show_rule, next.cancellation_rule,
      );
      if (body.businessName) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(String(body.businessName), user.id);
      const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      send(res, 200, providerSnapshot(fresh));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'provider' && parts[1] === 'appointments' && parts[3] === 'cancel') {
      if (!requireRole(user, res, 'provider')) return;
      const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND provider_id = ?').get(parts[2], user.id);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      if (row.status !== 'cancelled') {
        db.prepare("UPDATE appointments SET status = 'cancelled', deposit_outcome = ? WHERE id = ?").run(row.deposit_paid ? 'refunded' : null, row.id);
        if (row.deposit_paid && row.client_id) {
          await refundStripeDeposit(row);
          db.prepare('INSERT INTO transactions (id, user_id, title, detail, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
            crypto.randomUUID(), row.client_id, 'Refund', `${row.provider_name} · ${row.service}`, row.deposit, 'Refunded', Date.now(),
          );
          await notify(row.client_id, 'Appointment cancelled', `${user.name} cancelled the visit. The deposit is refunded.`);
        }
        await notify(user.id, 'Appointment cancelled', `${row.service} was cancelled.`);
      }
      send(res, 200, providerSnapshot(user));
      return;
    }

    if (req.method === 'POST' && parts[0] === 'provider' && parts[1] === 'appointments' && parts[3] === 'no-show') {
      if (!requireRole(user, res, 'provider')) return;
      const row = db.prepare('SELECT * FROM appointments WHERE id = ? AND provider_id = ?').get(parts[2], user.id);
      if (!row) return send(res, 404, { error: 'Appointment not found.' });
      const body = await readBody(req);
      const id = crypto.randomUUID();
      const detail = String(body.note || '').trim() || 'The client did not attend within the allowed time.';
      db.prepare('INSERT INTO disputes (id, user_id, appointment_id, title, detail, evidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, user.id, row.id, 'Client no-show', detail, null, 'In review', Date.now(),
      );
      keepDeposit(row);
      audit(user.id, 'client-no-show', `${row.service} deposit kept`);
      if (row.client_id) await notify(row.client_id, 'No-show claim', `${user.name} reported that you did not attend. The deposit is kept.`);
      await notify(user.id, 'No-show submitted', 'The deposit is kept under the no-show rule. An administrator can still review the claim.');
      send(res, 201, { id, ...providerSnapshot(user) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/provider/appointments') {
      if (!requireRole(user, res, 'provider')) return;
      const rows = db.prepare('SELECT * FROM appointments WHERE provider_id = ?').all(user.id).map(mapAppointment);
      send(res, 200, { appointments: rows });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/users') {
      if (!requireRole(user, res, 'admin')) return;
      send(res, 200, { users: db.prepare('SELECT id, role, name, email, phone, verified FROM users').all() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/appointments') {
      if (!requireRole(user, res, 'admin')) return;
      send(res, 200, { appointments: db.prepare('SELECT * FROM appointments').all().map(mapAppointment) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/disputes') {
      if (!requireRole(user, res, 'admin')) return;
      send(res, 200, { disputes: db.prepare('SELECT * FROM disputes ORDER BY created_at DESC').all() });
      return;
    }

    if (req.method === 'PATCH' && parts[0] === 'admin' && parts[1] === 'disputes' && parts[2]) {
      if (!requireRole(user, res, 'admin')) return;
      const body = await readBody(req);
      const status = String(body.status || '').trim();
      if (!status) return send(res, 400, { error: 'A status is required.' });
      const row = db.prepare('SELECT * FROM disputes WHERE id = ?').get(parts[2]);
      if (!row) return send(res, 404, { error: 'Dispute not found.' });
      const visit = row.appointment_id ? db.prepare('SELECT * FROM appointments WHERE id = ?').get(row.appointment_id) : null;
      const decision = status.toLowerCase();
      if (visit && (decision === 'refunded' || decision === 'refund')) {
        await refundStripeDeposit(visit);
        if (visit.deposit_paid && visit.deposit_outcome !== 'refunded' && visit.client_id) {
          insertTransaction(visit.client_id, 'Refund', `${visit.provider_name} · ${visit.service}`, visit.deposit, 'Refunded');
          db.prepare("UPDATE appointments SET status = 'cancelled', deposit_outcome = 'refunded' WHERE id = ?").run(visit.id);
        }
      }
      if (visit && (decision === 'released' || decision === 'payout')) {
        await releaseStripeDeposit(visit);
      }
      db.prepare('UPDATE disputes SET status = ? WHERE id = ?').run(status, row.id);
      audit(user.id, 'dispute-updated', `${row.id} is now ${status}`);
      await notify(row.user_id, 'Dispute updated', `Your dispute is now ${status}.`);
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/summary') {
      if (!requireRole(user, res, 'admin')) return;
      const count = (sql) => db.prepare(sql).get().n;
      send(res, 200, {
        users: count('SELECT COUNT(*) AS n FROM users'),
        clients: count("SELECT COUNT(*) AS n FROM users WHERE role = 'client'"),
        providers: count("SELECT COUNT(*) AS n FROM users WHERE role = 'provider'"),
        appointments: count('SELECT COUNT(*) AS n FROM appointments'),
        upcoming: count("SELECT COUNT(*) AS n FROM appointments WHERE status = 'upcoming'"),
        cancelled: count("SELECT COUNT(*) AS n FROM appointments WHERE status = 'cancelled'"),
        disputes: count('SELECT COUNT(*) AS n FROM disputes'),
        openDisputes: count("SELECT COUNT(*) AS n FROM disputes WHERE status = 'In review'"),
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/admin/audit') {
      if (!requireRole(user, res, 'admin')) return;
      send(res, 200, { audit: db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200').all() });
      return;
    }

    if (req.method === 'GET' && parts[0] === 'evidence' && parts[1]) {
      const filename = path.basename(parts[1]);
      const file = path.join(dataDir, 'evidence', filename);
      if (!fs.existsSync(file)) return send(res, 404, { error: 'Evidence not found.' });
      res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
      res.end(fs.readFileSync(file));
      return;
    }

    send(res, 404, { error: 'Not found.' });
  } catch (error) {
    send(res, error.status || 500, { error: error instanceof Error ? error.message : 'Server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`MYDL API listening on http://localhost:${PORT}`);
});

function sendReminders() {
  const rows = db.prepare("SELECT * FROM appointments WHERE status = 'upcoming' AND IFNULL(reminded, 0) = 0").all();
  for (const row of rows) {
    const start = appointmentStart(row);
    if (start == null) continue;
    const until = start - Date.now();
    if (until > 0 && until <= 24 * 60 * 60 * 1000) {
      notify(row.client_id, 'Upcoming visit', `${row.provider_name} · ${row.service} is within 24 hours, ${row.date} at ${row.time}.`).catch(() => {});
      if (row.provider_id) notify(row.provider_id, 'Upcoming visit', `${row.service} is within 24 hours.`).catch(() => {});
      db.prepare('UPDATE appointments SET reminded = 1 WHERE id = ?').run(row.id);
    }
  }
}
setInterval(sendReminders, 60_000);
sendReminders();
