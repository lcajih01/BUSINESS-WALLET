import { supabase, isSupabaseEnabled } from './supabase';

// ── Mappers: camelCase JS ↔ snake_case DB ─────────────────────────────────────

const txToDb = (t) => ({
  id:                t.id,
  type:              t.type,
  business:          t.business,
  wallet:            t.wallet,
  to_wallet:         t.toWallet         ?? null,
  transfer_group_id: t.transferGroupId  ?? null,
  category:          t.category         ?? null,
  amount:            t.amount,
  note:              t.note             ?? '',
  room:              t.room             ?? null,
  created_at:        t.createdAt,
});
const txFromDb = (r) => ({
  id:              r.id,
  type:            r.type,
  business:        r.business,
  wallet:          r.wallet,
  toWallet:        r.to_wallet         ?? null,
  transferGroupId: r.transfer_group_id ?? null,
  category:        r.category          ?? null,
  amount:          Number(r.amount),
  note:            r.note              ?? '',
  room:            r.room              ?? null,
  createdAt:       r.created_at,
});

const billToDb = (b) => ({
  id:           b.id,
  name:         b.name,
  business:     b.business,
  amount:       b.amount,
  due_date:     b.dueDate,
  priority:     b.priority,
  category:     b.category     ?? null,
  paid_amount:  b.paidAmount   ?? 0,
  paid_at:      b.paidAt       ?? null,
  is_recurring: b.isRecurring  ?? false,
  recurring_id: b.recurringId  ?? null,
  recurring_day:b.recurringDay ?? null,
});
const billFromDb = (r) => ({
  id:          r.id,
  name:        r.name,
  business:    r.business,
  amount:      Number(r.amount),
  dueDate:     r.due_date,
  priority:    r.priority,
  category:    r.category      ?? null,
  paidAmount:  Number(r.paid_amount ?? 0),
  paidAt:      r.paid_at       ?? null,
  isRecurring: r.is_recurring  ?? false,
  recurringId: r.recurring_id  ?? null,
  recurringDay:r.recurring_day ?? null,
});

const recurringToDb = (r) => ({
  id:           r.id,
  name:         r.name,
  business:     r.business,
  amount:       r.amount,
  priority:     r.priority,
  category:     r.category    ?? null,
  frequency:    r.frequency,
  day_of_month: r.dayOfMonth  ?? null,
  notes:        r.notes       ?? '',
  next_due_date:r.nextDueDate,
  is_active:    r.isActive    ?? true,
  created_at:   r.createdAt,
});
const recurringFromDb = (r) => ({
  id:          r.id,
  name:        r.name,
  business:    r.business,
  amount:      Number(r.amount),
  priority:    r.priority,
  category:    r.category     ?? null,
  frequency:   r.frequency,
  dayOfMonth:  r.day_of_month ?? null,
  notes:       r.notes        ?? '',
  nextDueDate: r.next_due_date,
  isActive:    r.is_active    ?? true,
  createdAt:   r.created_at,
});

const depositToDb = (d) => ({
  id:           d.id,
  business:     d.business,
  guest_name:   d.guestName,
  room:         d.room        ?? '',
  amount:       d.amount,
  payment_type: d.paymentType,
  wallet_id:    d.walletId,
  status:       d.status,
  check_in:     d.checkIn     ?? null,
  check_out:    d.checkOut    ?? null,
  created_at:   d.createdAt,
  refunded_at:  d.refundedAt  ?? null,
  notes:        d.notes       ?? '',
});
const depositFromDb = (r) => ({
  id:          r.id,
  business:    r.business,
  guestName:   r.guest_name,
  room:        r.room        ?? '',
  amount:      Number(r.amount),
  paymentType: r.payment_type,
  walletId:    r.wallet_id,
  status:      r.status,
  checkIn:     r.check_in    ?? null,
  checkOut:    r.check_out   ?? null,
  createdAt:   r.created_at,
  refundedAt:  r.refunded_at ?? null,
  notes:       r.notes       ?? '',
});

const recvToDb = (r) => ({
  id:           r.id,
  wallet_id:    r.walletId,
  business:     r.business,
  source:       r.source,
  amount:       r.amount,
  receive_date: r.receiveDate,
  status:       r.status,
  notes:        r.notes      ?? '',
  received_at:  r.receivedAt ?? null,
  created_at:   r.createdAt,
});
const recvFromDb = (r) => ({
  id:          r.id,
  walletId:    r.wallet_id,
  business:    r.business,
  source:      r.source,
  amount:      Number(r.amount),
  receiveDate: r.receive_date,
  status:      r.status,
  notes:       r.notes       ?? '',
  receivedAt:  r.received_at ?? null,
  createdAt:   r.created_at,
});

// ── Single-row CRUD ───────────────────────────────────────────────────────────

export async function upsertTransaction(t) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('transactions').upsert(txToDb(t));
  if (error) throw error;
}
export async function deleteTransaction(id) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertBill(b) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('bills').upsert(billToDb(b));
  if (error) throw error;
}
export async function deleteBill(id) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('bills').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertRecurringBill(r) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('recurring_bills').upsert(recurringToDb(r));
  if (error) throw error;
}

export async function upsertDeposit(d) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('deposits').upsert(depositToDb(d));
  if (error) throw error;
}

export async function upsertReceivable(r) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('receivables').upsert(recvToDb(r));
  if (error) throw error;
}
export async function deleteReceivable(id) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.from('receivables').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertBalances(balancesObj) {
  if (!isSupabaseEnabled) return;
  const rows = Object.entries(balancesObj).map(([id, balance]) => ({
    id,
    balance,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('wallet_balances').upsert(rows);
  if (error) throw error;
}

// ── Bulk ops ──────────────────────────────────────────────────────────────────

export async function loadAll() {
  if (!isSupabaseEnabled) return null;

  const [
    { data: balRows,  error: e1 },
    { data: txRows,   error: e2 },
    { data: billRows, error: e3 },
    { data: recRows,  error: e4 },
    { data: depRows,  error: e5 },
    { data: recvRows, error: e6 },
  ] = await Promise.all([
    supabase.from('wallet_balances').select('*'),
    supabase.from('transactions').select('*').order('created_at', { ascending: false }),
    supabase.from('bills').select('*'),
    supabase.from('recurring_bills').select('*').order('created_at', { ascending: false }),
    supabase.from('deposits').select('*').order('created_at', { ascending: false }),
    supabase.from('receivables').select('*').order('created_at', { ascending: false }),
  ]);

  const firstErr = e1 || e2 || e3 || e4 || e5 || e6;
  if (firstErr) throw new Error(firstErr.message || 'Supabase loadAll failed');

  const walletBalances = {};
  (balRows || []).forEach(r => { walletBalances[r.id] = Number(r.balance); });

  return {
    walletBalances,
    transactions:   (txRows   || []).map(txFromDb),
    bills:          (billRows || []).map(billFromDb),
    recurringBills: (recRows  || []).map(recurringFromDb),
    deposits:       (depRows  || []).map(depositFromDb),
    receivables:    (recvRows || []).map(recvFromDb),
  };
}

export async function uploadAll(state) {
  if (!isSupabaseEnabled) return;
  await Promise.all([
    upsertBalances(state.walletBalances),
    ...state.transactions.map(upsertTransaction),
    ...state.bills.map(upsertBill),
    ...(state.recurringBills || []).map(upsertRecurringBill),
    ...state.deposits.map(upsertDeposit),
    ...state.receivables.map(upsertReceivable),
  ]);
}

export async function deleteAll() {
  if (!isSupabaseEnabled) return;
  await Promise.all([
    supabase.from('wallet_balances').delete().not('id', 'is', null),
    supabase.from('transactions').delete().not('id', 'is', null),
    supabase.from('bills').delete().not('id', 'is', null),
    supabase.from('recurring_bills').delete().not('id', 'is', null),
    supabase.from('deposits').delete().not('id', 'is', null),
    supabase.from('receivables').delete().not('id', 'is', null),
  ]);
}
