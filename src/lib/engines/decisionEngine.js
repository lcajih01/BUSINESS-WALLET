import { getRealCash, getBusinessTotal, getAvailableBalance } from './walletEngine';

// ── Date helpers ──────────────────────────────────────────────────────────────

export function getDaysLeft(dueDateISO) {
  const due = new Date(dueDateISO);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((due - now) / 86400000);
}

// ── Bill status ───────────────────────────────────────────────────────────────

export function getBillStatus(bill) {
  const paid = bill.paidAmount || 0;
  if (paid >= bill.amount) return 'PAID';
  if (paid > 0) return 'PARTIAL';
  if (getDaysLeft(bill.dueDate) < 0) return 'OVERDUE';
  return 'PENDING';
}

export function getBillRemaining(bill) {
  return bill.amount - (bill.paidAmount || 0);
}

// ── Obligation calculations ───────────────────────────────────────────────────

// All unpaid obligations regardless of date
export function getTotalObligations(bills) {
  return (bills || [])
    .filter(b => getBillStatus(b) !== 'PAID')
    .reduce((sum, b) => sum + getBillRemaining(b), 0);
}

// Obligations due within N days
export function getUpcomingObligations(bills, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return (bills || [])
    .filter(b => getBillStatus(b) !== 'PAID' && new Date(b.dueDate) <= cutoff)
    .reduce((sum, b) => sum + getBillRemaining(b), 0);
}

// ── Health status ─────────────────────────────────────────────────────────────

export function computeHealthStatus(availableCash, obligations) {
  if (obligations <= 0) return 'SAFE';
  const ratio = availableCash / obligations;
  if (ratio >= 1.3) return 'SAFE';
  if (ratio >= 0.9) return 'WARNING';
  return 'SHORT';
}

export function getSurvivalDays(realCash, totalObligations) {
  if (totalObligations <= 0) return 999;
  const dailyBurn = totalObligations / 30;
  return Math.floor(realCash / dailyBurn);
}

// ── Full decision snapshot ────────────────────────────────────────────────────

export function computeDecision(state) {
  const realCash           = getRealCash(state);
  const obligations        = getTotalObligations(state.bills);
  const upcoming30         = getUpcomingObligations(state.bills, 30);
  const status             = computeHealthStatus(realCash, upcoming30);

  const HSHCash = getBusinessTotal(state, 'HSH');
  const TRZCash = getBusinessTotal(state, 'TRZ');
  const PERSCash = getBusinessTotal(state, 'PERSONAL');

  const billsFor = (biz) => state.bills.filter(b => b.business === biz);
  const HSHDue  = getUpcomingObligations(billsFor('HSH'), 30);
  const TRZDue  = getUpcomingObligations(billsFor('TRZ'), 30);

  return {
    realCash,
    obligations,
    upcoming30,
    status,
    survivalDays: getSurvivalDays(realCash, obligations),
    HSH:  { cash: HSHCash,  due: HSHDue,  status: computeHealthStatus(HSHCash,  HSHDue)  },
    TRZ:  { cash: TRZCash,  due: TRZDue,  status: computeHealthStatus(TRZCash,  TRZDue)  },
    PERS: { cash: PERSCash, due: 0,       status: 'SAFE'                                  },
  };
}
