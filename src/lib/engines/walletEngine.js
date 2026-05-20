import { WALLETS } from '../constants';

// ── Reserved & Available ──────────────────────────────────────────────────────

// Reserved = sum of active CASH security deposit amounts on this wallet
export function getReservedBalance(state, walletId) {
  return (state.deposits || [])
    .filter(d => d.walletId === walletId && d.status === 'ACTIVE')
    .reduce((sum, d) => sum + d.amount, 0);
}

export function getAvailableBalance(state, walletId) {
  const balance = state.walletBalances[walletId] || 0;
  return balance - getReservedBalance(state, walletId);
}

// ── Receivables ───────────────────────────────────────────────────────────────

export function getPendingReceivables(state) {
  const now = new Date();
  return (state.receivables || []).filter(r =>
    r.status === 'PENDING' && new Date(r.receiveDate) > now
  );
}

export function getAvailableReceivables(state) {
  const now = new Date();
  return (state.receivables || []).filter(r =>
    r.status === 'PENDING' && new Date(r.receiveDate) <= now
  );
}

export function getPendingReceivableBalance(state, walletId) {
  return getPendingReceivables(state)
    .filter(r => r.walletId === walletId)
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getAllReceivableBalance(state, walletId) {
  return state.receivables
    .filter(r => r.walletId === walletId && r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);
}

// ── Business Totals ───────────────────────────────────────────────────────────

// Real Cash on Hand = sum of available balances on isCash wallets only
export function getRealCash(state) {
  return WALLETS
    .filter(w => w.isCash)
    .reduce((sum, w) => sum + getAvailableBalance(state, w.id), 0);
}

// Business total = available balances across all non-receivable wallets for that business
// Receivables only count when their receive date has passed (via getAvailableReceivables)
export function getBusinessTotal(state, business) {
  const walletTotal = WALLETS
    .filter(w => w.business === business && !w.isReceivable)
    .reduce((sum, w) => sum + getAvailableBalance(state, w.id), 0);

  const dueRecvTotal = getAvailableReceivables(state)
    .filter(r => r.business === business)
    .reduce((sum, r) => sum + r.amount, 0);

  return walletTotal + dueRecvTotal;
}

export function getTotalAll(state) {
  return ['HSH', 'TRZ', 'PERSONAL'].reduce(
    (sum, biz) => sum + getBusinessTotal(state, biz), 0
  );
}

// ── Daily Cash Flow ───────────────────────────────────────────────────────────

export function getTodayCashFlow(state, business = null) {
  const todayStr = new Date().toDateString();
  const txToday = state.transactions.filter(tx => {
    const bizMatch = business ? tx.business === business : true;
    const isCOH = WALLETS.find(w => w.id === tx.wallet)?.isCash;
    return bizMatch && isCOH && new Date(tx.createdAt).toDateString() === todayStr;
  });

  const cashIn  = txToday.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const cashOut = txToday.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  return { cashIn, cashOut, net: cashIn - cashOut };
}

// Today's income by wallet type (for daily summary breakdown)
export function getTodayIncomeByType(state) {
  const todayStr = new Date().toDateString();
  const incomeToday = state.transactions.filter(tx =>
    tx.type === 'INCOME' && new Date(tx.createdAt).toDateString() === todayStr
  );

  const byType = {};
  for (const tx of incomeToday) {
    const wallet = WALLETS.find(w => w.id === tx.wallet);
    const key = wallet?.type || 'CASH';
    byType[key] = (byType[key] || 0) + tx.amount;
  }
  return byType;
}
