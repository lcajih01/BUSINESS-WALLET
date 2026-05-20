import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WALLETS } from '../lib/constants';
import * as db from '../lib/supabaseSync';

// ── Seed helpers ──────────────────────────────────────────────────────────────
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};
const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();
// Returns YYYY-MM-DD — used for bill dueDates so Calendar date matching is exact
const dateFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_BALANCES = {
  HSH_COH:     54230,
  HSH_BK_RECV: 0,
  TRZ_COH:     28450,
  TRZ_RECV:    0,
  PERS_CASH:   8400,
  PERS_MAYA:   4500,
  PERS_GCASH:  11000,
  PERS_BANK:   22000,
};

const SEED_TRANSACTIONS = [
  { id: 'tx1',  type: 'INCOME',   business: 'HSH',      wallet: 'HSH_COH',    category: 'ROOM_PAYMENT', amount: 2500,  note: 'Room 101',         room: '101', createdAt: hoursAgo(1)  },
  { id: 'tx2',  type: 'EXPENSE',  business: 'HSH',      wallet: 'HSH_COH',    category: 'ELECTRICITY',  amount: 8500,  note: 'May bill',          createdAt: hoursAgo(3)  },
  { id: 'tx3',  type: 'INCOME',   business: 'HSH',      wallet: 'HSH_COH',    category: 'MINIBAR',      amount: 450,   note: 'Room 103',         room: '103', createdAt: hoursAgo(5)  },
  { id: 'tx4',  type: 'EXPENSE',  business: 'HSH',      wallet: 'HSH_COH',    category: 'STAFF_MEAL',   amount: 850,   note: '',                  createdAt: hoursAgo(8)  },
  { id: 'tx5',  type: 'TRANSFER', business: 'PERSONAL', wallet: 'PERS_GCASH', toWallet: 'HSH_COH', transferGroupId: 'tg1', amount: 5000, note: 'Bridge to HSH', createdAt: hoursAgo(30) },
  { id: 'tx6',  type: 'INCOME',   business: 'TRZ',      wallet: 'TRZ_COH',    category: 'ROOM_PAYMENT', amount: 3000,  note: 'Room 205',         room: '205', createdAt: hoursAgo(32) },
  { id: 'tx7',  type: 'EXPENSE',  business: 'HSH',      wallet: 'HSH_COH',    category: 'PAYROLL',      amount: 25000, note: '1st half May',      createdAt: hoursAgo(48) },
  { id: 'tx8',  type: 'INCOME',   business: 'TRZ',      wallet: 'TRZ_COH',    category: 'WALK_IN',      amount: 1800,  note: '',                  createdAt: hoursAgo(50) },
  { id: 'tx9',  type: 'EXPENSE',  business: 'TRZ',      wallet: 'TRZ_COH',    category: 'SUPPLIES',     amount: 2200,  note: 'Cleaning supplies', createdAt: hoursAgo(72) },
  { id: 'tx10', type: 'EXPENSE',  business: 'PERSONAL', wallet: 'PERS_GCASH', category: 'INTERNET',     amount: 2200,  note: 'PLDT monthly',      createdAt: hoursAgo(74) },
];

const SEED_BILLS = [
  { id: 'b1',  name: 'Electricity Bill',       business: 'HSH', amount: 12300, dueDate: dateFromNow(3),  priority: 'CRITICAL',  paidAmount: 0, isRecurring: true,  recurringDay: 20 },
  { id: 'b2',  name: 'Payroll (1st Half)',      business: 'HSH', amount: 85000, dueDate: dateFromNow(3),  priority: 'CRITICAL',  paidAmount: 0, isRecurring: true,  recurringDay: 15 },
  { id: 'b3',  name: 'Internet (PLDT)',         business: 'HSH', amount: 2200,  dueDate: dateFromNow(6),  priority: 'IMPORTANT', paidAmount: 0, isRecurring: true,  recurringDay: 18 },
  { id: 'b4',  name: 'Booking.com Remittance', business: 'HSH', amount: 45000, dueDate: dateFromNow(8),  priority: 'CRITICAL',  paidAmount: 0, isRecurring: false },
  { id: 'b5',  name: 'Water Bill',             business: 'TRZ', amount: 3800,  dueDate: dateFromNow(10), priority: 'IMPORTANT', paidAmount: 0, isRecurring: true,  recurringDay: 22 },
  { id: 'b6',  name: 'Electricity Bill',       business: 'TRZ', amount: 9500,  dueDate: dateFromNow(10), priority: 'CRITICAL',  paidAmount: 0, isRecurring: true,  recurringDay: 22 },
  { id: 'b7',  name: 'Payroll (1st Half)',      business: 'TRZ', amount: 42000, dueDate: dateFromNow(-2), priority: 'CRITICAL',  paidAmount: 0, isRecurring: true,  recurringDay: 15 },
  { id: 'b8',  name: 'BIR Tax Quarterly',      business: 'HSH', amount: 15000, dueDate: dateFromNow(13), priority: 'CRITICAL',  paidAmount: 0, isRecurring: false },
  { id: 'b9',  name: 'Internet',               business: 'TRZ', amount: 1800,  dueDate: dateFromNow(8),  priority: 'IMPORTANT', paidAmount: 0, isRecurring: true,  recurringDay: 20 },
  { id: 'b10', name: 'Cleaning Supplies',      business: 'TRZ', amount: 4500,  dueDate: dateFromNow(16), priority: 'FLEXIBLE',  paidAmount: 0, isRecurring: false },
];

const SEED_DEPOSITS = [
  { id: 'sd1', business: 'HSH', guestName: 'Mr. Santos', room: '201', amount: 2000, paymentType: 'CASH',  walletId: 'HSH_COH',    status: 'ACTIVE', checkIn: daysFromNow(-5), checkOut: daysFromNow(2),  createdAt: daysFromNow(-5), refundedAt: null, notes: '' },
  { id: 'sd2', business: 'HSH', guestName: 'Ms. Reyes',  room: '105', amount: 2000, paymentType: 'CASH',  walletId: 'HSH_COH',    status: 'ACTIVE', checkIn: daysFromNow(-4), checkOut: daysFromNow(3),  createdAt: daysFromNow(-4), refundedAt: null, notes: '' },
  { id: 'sd3', business: 'TRZ', guestName: 'Mr. Cruz',   room: '304', amount: 3000, paymentType: 'CASH',  walletId: 'TRZ_COH',    status: 'ACTIVE', checkIn: daysFromNow(-3), checkOut: daysFromNow(4),  createdAt: daysFromNow(-3), refundedAt: null, notes: '' },
  { id: 'sd4', business: 'HSH', guestName: 'Ms. Garcia', room: '202', amount: 2000, paymentType: 'GCASH', walletId: 'PERS_GCASH', status: 'ACTIVE', checkIn: daysFromNow(-2), checkOut: daysFromNow(5),  createdAt: daysFromNow(-2), refundedAt: null, notes: '' },
];

const SEED_RECEIVABLES = [
  { id: 'recv1', walletId: 'HSH_BK_RECV', business: 'HSH', source: 'Booking.com',    amount: 30000, receiveDate: daysFromNow(5),  status: 'PENDING', notes: 'May 10–15 bookings', createdAt: daysFromNow(-5), receivedAt: null },
  { id: 'recv2', walletId: 'TRZ_RECV',    business: 'TRZ', source: 'Advance deposits', amount: 15000, receiveDate: daysFromNow(2), status: 'PENDING', notes: '',                  createdAt: daysFromNow(-2), receivedAt: null },
];

// ── Recurring bill helpers ────────────────────────────────────────────────────

function computeNextDueDate(fromDate, frequency, dayOfMonth) {
  const d = new Date(fromDate + 'T12:00:00');
  if (frequency === 'MONTHLY')   d.setMonth(d.getMonth() + 1);
  if (frequency === 'BIMONTHLY') d.setMonth(d.getMonth() + 2);
  if (frequency === 'QUARTERLY') d.setMonth(d.getMonth() + 3);
  if (frequency === 'ANNUAL')    d.setFullYear(d.getFullYear() + 1);
  if (dayOfMonth) {
    const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(dayOfMonth, maxDay));
  }
  return d.toISOString().slice(0, 10);
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────
      walletBalances: SEED_BALANCES,
      transactions:   SEED_TRANSACTIONS,
      bills:          SEED_BILLS,
      deposits:       SEED_DEPOSITS,
      receivables:    SEED_RECEIVABLES,
      recurringBills: [],

      // ── Supabase Bootstrap ──────────────────────────────────────────────────
      // Loads remote data on app open. If remote is empty, uploads local state
      // as first-time migration. Falls back silently to localStorage on error.
      initFromSupabase: async () => {
        try {
          const remote = await db.loadAll();
          if (!remote) return; // Supabase not configured — localStorage is authoritative
          const hasRemoteData =
            remote.transactions.length > 0 ||
            remote.bills.length > 0 ||
            Object.keys(remote.walletBalances).length > 0;
          if (hasRemoteData) {
            set({
              walletBalances: remote.walletBalances,
              transactions:   remote.transactions,
              bills:          remote.bills,
              deposits:       remote.deposits,
              receivables:    remote.receivables,
              recurringBills: remote.recurringBills,
            });
          } else {
            // First connection: migrate existing localStorage to Supabase
            await db.uploadAll(get());
          }
        } catch (e) {
          console.warn('[Supabase] Load failed, using local cache:', e.message);
        }
      },

      // ── Transaction Engine ──────────────────────────────────────────────────
      addTransaction: (tx) => {
        if (tx.type === 'TRANSFER') {
          console.warn('addTransaction called with TRANSFER type. Use addTransfer instead.');
          return;
        }
        const newTx = { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        set(state => {
          const balances = { ...state.walletBalances };
          if (tx.type === 'INCOME')  balances[tx.wallet] = (balances[tx.wallet] || 0) + tx.amount;
          if (tx.type === 'EXPENSE') balances[tx.wallet] = (balances[tx.wallet] || 0) - tx.amount;
          return { transactions: [newTx, ...state.transactions], walletBalances: balances };
        });
        db.upsertTransaction(newTx).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      editTransaction: (id, patch) => {
        set(state => {
          const old = state.transactions.find(t => t.id === id);
          if (!old) return state;
          const bal = { ...state.walletBalances };
          if (old.type === 'INCOME')    bal[old.wallet]   = (bal[old.wallet]   || 0) - old.amount;
          if (old.type === 'EXPENSE')   bal[old.wallet]   = (bal[old.wallet]   || 0) + old.amount;
          if (old.type === 'TRANSFER') { bal[old.wallet] = (bal[old.wallet] || 0) + old.amount; bal[old.toWallet] = (bal[old.toWallet] || 0) - old.amount; }
          const next = { ...old, ...patch };
          if (next.type === 'INCOME')   bal[next.wallet]  = (bal[next.wallet]  || 0) + next.amount;
          if (next.type === 'EXPENSE')  bal[next.wallet]  = (bal[next.wallet]  || 0) - next.amount;
          if (next.type === 'TRANSFER') { bal[next.wallet] = (bal[next.wallet] || 0) - next.amount; bal[next.toWallet] = (bal[next.toWallet] || 0) + next.amount; }
          return { transactions: state.transactions.map(t => t.id === id ? next : t), walletBalances: bal };
        });
        const updated = get().transactions.find(t => t.id === id);
        if (updated) db.upsertTransaction(updated).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      deleteTransaction: (id) => {
        set(state => {
          const tx = state.transactions.find(t => t.id === id);
          if (!tx) return state;
          const bal = { ...state.walletBalances };
          if (tx.type === 'INCOME')    bal[tx.wallet]   = (bal[tx.wallet]   || 0) - tx.amount;
          if (tx.type === 'EXPENSE')   bal[tx.wallet]   = (bal[tx.wallet]   || 0) + tx.amount;
          if (tx.type === 'TRANSFER') { bal[tx.wallet] = (bal[tx.wallet] || 0) + tx.amount; bal[tx.toWallet] = (bal[tx.toWallet] || 0) - tx.amount; }
          return { transactions: state.transactions.filter(t => t.id !== id), walletBalances: bal };
        });
        db.deleteTransaction(id).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      // ── Transfer Engine ─────────────────────────────────────────────────────
      addTransfer: ({ from, to, amount, note }) => {
        const fromWallet = WALLETS.find(w => w.id === from);
        const tx = {
          id:              crypto.randomUUID(),
          type:            'TRANSFER',
          business:        fromWallet?.business || 'HSH',
          wallet:          from,
          toWallet:        to,
          transferGroupId: crypto.randomUUID(),
          category:        null,
          amount,
          note:            note || '',
          createdAt:       new Date().toISOString(),
        };
        set(state => {
          const balances = { ...state.walletBalances };
          balances[from] = (balances[from] || 0) - amount;
          balances[to]   = (balances[to]   || 0) + amount;
          return { transactions: [tx, ...state.transactions], walletBalances: balances };
        });
        db.upsertTransaction(tx).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      // ── Bills Engine ────────────────────────────────────────────────────────
      addBill: (bill) => {
        const newBill = {
          ...bill,
          id:         crypto.randomUUID(),
          paidAmount: 0,
          dueDate:    bill.dueDate ? String(bill.dueDate).slice(0, 10) : bill.dueDate,
        };
        set(state => ({ bills: [...state.bills, newBill] }));
        db.upsertBill(newBill).catch(console.error);
      },

      payBill: (id, amount) => {
        set(state => ({
          bills: state.bills.map(b => {
            if (b.id !== id) return b;
            const payAmt  = amount ?? b.amount;
            const newPaid = Math.min(b.amount, (b.paidAmount || 0) + payAmt);
            return { ...b, paidAmount: newPaid, paidAt: newPaid >= b.amount ? new Date().toISOString() : (b.paidAt || null) };
          }),
        }));
        const updated = get().bills.find(b => b.id === id);
        if (updated) db.upsertBill(updated).catch(console.error);
      },

      markBillUnpaid: (id) => {
        set(state => ({ bills: state.bills.map(b => b.id === id ? { ...b, paidAmount: 0, paidAt: null } : b) }));
        const updated = get().bills.find(b => b.id === id);
        if (updated) db.upsertBill(updated).catch(console.error);
      },

      editBill: (id, patch) => {
        set(state => ({
          bills: state.bills.map(b => {
            if (b.id !== id) return b;
            const updated = { ...b, ...patch };
            if ((updated.paidAmount || 0) > updated.amount) updated.paidAmount = updated.amount;
            return updated;
          }),
        }));
        const updated = get().bills.find(b => b.id === id);
        if (updated) db.upsertBill(updated).catch(console.error);
      },

      deleteBill: (id) => {
        set(state => ({ bills: state.bills.filter(b => b.id !== id) }));
        db.deleteBill(id).catch(console.error);
      },

      setWalletBalance: (walletId, newBalance) => {
        set(state => ({ walletBalances: { ...state.walletBalances, [walletId]: Number(newBalance) } }));
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      // ── Recurring Bill Templates Engine ─────────────────────────────────────
      addRecurringBill: (template) => {
        const id = crypto.randomUUID();
        const recurring = {
          id,
          name:        template.name,
          business:    template.business,
          amount:      template.amount,
          priority:    template.priority,
          category:    template.category || null,
          frequency:   template.frequency,
          dayOfMonth:  template.dayOfMonth || null,
          notes:       template.notes || '',
          nextDueDate: template.firstDueDate,
          isActive:    true,
          createdAt:   new Date().toISOString(),
        };
        const firstBill = {
          id:          crypto.randomUUID(),
          name:        template.name,
          business:    template.business,
          amount:      template.amount,
          priority:    template.priority,
          category:    template.category || null,
          dueDate:     template.firstDueDate,
          paidAmount:  0,
          isRecurring: true,
          recurringId: id,
        };
        const nextDate      = computeNextDueDate(template.firstDueDate, template.frequency, template.dayOfMonth || null);
        const finalRecurring = { ...recurring, nextDueDate: nextDate };
        set(state => ({
          recurringBills: [finalRecurring, ...state.recurringBills],
          bills:          [firstBill, ...state.bills],
        }));
        db.upsertRecurringBill(finalRecurring).catch(console.error);
        db.upsertBill(firstBill).catch(console.error);
      },

      generateNextBill: (recurringId) => {
        const template = get().recurringBills.find(r => r.id === recurringId);
        if (!template || !template.isActive) return;
        const newBill = {
          id:          crypto.randomUUID(),
          name:        template.name,
          business:    template.business,
          amount:      template.amount,
          priority:    template.priority,
          category:    template.category || null,
          dueDate:     template.nextDueDate,
          paidAmount:  0,
          isRecurring: true,
          recurringId,
        };
        const nextDate = computeNextDueDate(template.nextDueDate, template.frequency, template.dayOfMonth);
        set(state => ({
          recurringBills: state.recurringBills.map(r => r.id === recurringId ? { ...r, nextDueDate: nextDate } : r),
          bills:          [newBill, ...state.bills],
        }));
        const updatedTemplate = get().recurringBills.find(r => r.id === recurringId);
        if (updatedTemplate) db.upsertRecurringBill(updatedTemplate).catch(console.error);
        db.upsertBill(newBill).catch(console.error);
      },

      toggleRecurringBill: (id) => {
        set(state => ({
          recurringBills: state.recurringBills.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r),
        }));
        const updated = get().recurringBills.find(r => r.id === id);
        if (updated) db.upsertRecurringBill(updated).catch(console.error);
      },

      // Called on app open — generates all bills whose nextDueDate has arrived.
      // Safe to call repeatedly; only runs when nextDueDate <= today.
      checkAndGenerateRecurringBills: () => {
        const state = get();
        const today = new Date().toISOString().slice(0, 10);
        const newBills = [];
        const origTemplates = state.recurringBills || [];
        const updatedTemplates = origTemplates.map(r => {
          if (!r.isActive) return r;
          let template = { ...r };
          while (template.nextDueDate <= today) {
            newBills.push({
              id:          crypto.randomUUID(),
              name:        template.name,
              business:    template.business,
              amount:      template.amount,
              priority:    template.priority,
              category:    template.category || null,
              dueDate:     template.nextDueDate,
              paidAmount:  0,
              isRecurring: true,
              recurringId: template.id,
            });
            const nextDate = computeNextDueDate(template.nextDueDate, template.frequency, template.dayOfMonth);
            template = { ...template, nextDueDate: nextDate };
          }
          return template;
        });
        if (newBills.length === 0) return;
        set({ recurringBills: updatedTemplates, bills: [...newBills, ...(state.bills || [])] });
        // Sync only templates whose nextDueDate actually advanced
        origTemplates.forEach((orig, i) => {
          if (updatedTemplates[i].nextDueDate !== orig.nextDueDate) {
            db.upsertRecurringBill(updatedTemplates[i]).catch(console.error);
          }
        });
        newBills.forEach(b => db.upsertBill(b).catch(console.error));
      },

      // ── Security Deposit Engine ─────────────────────────────────────────────
      addDeposit: (deposit) => {
        const newDep = { ...deposit, id: crypto.randomUUID(), status: 'ACTIVE', createdAt: new Date().toISOString(), refundedAt: null };
        set(state => {
          const balances = { ...state.walletBalances };
          balances[deposit.walletId] = (balances[deposit.walletId] || 0) + deposit.amount;
          return { deposits: [newDep, ...state.deposits], walletBalances: balances };
        });
        db.upsertDeposit(newDep).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      refundDeposit: (id) => {
        const deposit = get().deposits.find(d => d.id === id);
        if (!deposit || deposit.status === 'REFUNDED') return;
        set(state => {
          const balances = { ...state.walletBalances };
          balances[deposit.walletId] = (balances[deposit.walletId] || 0) - deposit.amount;
          return {
            deposits:       state.deposits.map(d => d.id === id ? { ...d, status: 'REFUNDED', refundedAt: new Date().toISOString() } : d),
            walletBalances: balances,
          };
        });
        const updated = get().deposits.find(d => d.id === id);
        if (updated) db.upsertDeposit(updated).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      // ── Receivables Engine ──────────────────────────────────────────────────
      addReceivable: (recv) => {
        const newRecv = { ...recv, id: crypto.randomUUID(), status: 'PENDING', createdAt: new Date().toISOString(), receivedAt: null };
        set(state => ({ receivables: [newRecv, ...state.receivables] }));
        db.upsertReceivable(newRecv).catch(console.error);
      },

      markReceivableReceived: (id) => {
        const recv = get().receivables.find(r => r.id === id);
        if (!recv || recv.status !== 'PENDING') return;
        const targetWallet = recv.business === 'HSH' ? 'HSH_COH'
          : recv.business === 'TRZ' ? 'TRZ_COH'
          : 'PERS_CASH';
        set(state => {
          const balances = { ...state.walletBalances };
          balances[targetWallet] = (balances[targetWallet] || 0) + recv.amount;
          return {
            receivables:    state.receivables.map(r => r.id === id ? { ...r, status: 'RECEIVED', receivedAt: new Date().toISOString() } : r),
            walletBalances: balances,
          };
        });
        const updated = get().receivables.find(r => r.id === id);
        if (updated) db.upsertReceivable(updated).catch(console.error);
        db.upsertBalances(get().walletBalances).catch(console.error);
      },

      editReceivable: (id, patch) => {
        set(state => ({ receivables: state.receivables.map(r => r.id === id ? { ...r, ...patch } : r) }));
        const updated = get().receivables.find(r => r.id === id);
        if (updated) db.upsertReceivable(updated).catch(console.error);
      },

      deleteReceivable: (id) => {
        set(state => ({ receivables: state.receivables.filter(r => r.id !== id) }));
        db.deleteReceivable(id).catch(console.error);
      },

      cancelReceivable: (id) => {
        set(state => ({ receivables: state.receivables.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r) }));
        const updated = get().receivables.find(r => r.id === id);
        if (updated) db.upsertReceivable(updated).catch(console.error);
      },

      // ── Dev util ────────────────────────────────────────────────────────────
      resetToSeed: () => {
        const seedState = {
          walletBalances: SEED_BALANCES,
          transactions:   SEED_TRANSACTIONS,
          bills:          SEED_BILLS,
          deposits:       SEED_DEPOSITS,
          receivables:    SEED_RECEIVABLES,
          recurringBills: [],
        };
        set(seedState);
        db.deleteAll().then(() => db.uploadAll(seedState)).catch(console.error);
      },
    }),
    {
      name:    'hotel-wallet-v2',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        walletBalances: persisted.walletBalances || current.walletBalances,
        transactions:   persisted.transactions   || current.transactions,
        bills:          persisted.bills          || current.bills,
        deposits:       persisted.deposits       || current.deposits,
        receivables:    persisted.receivables    || current.receivables,
        recurringBills: persisted.recurringBills || current.recurringBills,
      }),
    }
  )
);
