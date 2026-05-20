// Mock data for Phase 1 frontend shell

export const mockWalletBalances = {
  HSH_CASH:   54230,
  HSH_GCASH:  33210,
  HSH_MAYA:   12180,
  HSH_BANK:   25810,
  TRZ_CASH:   28450,
  TRZ_GCASH:  18300,
  TRZ_MAYA:    9200,
  TRZ_BANK:   15600,
  PERS_CASH:   8400,
  PERS_GCASH: 11000,
  PERS_MAYA:   4500,
  PERS_BANK:  22000,
};

export const mockTransactions = [
  {
    id: 't1', type: 'INCOME', category: 'ROOM_PAYMENT', business: 'HSH',
    wallet: 'HSH_CASH', amount: 2500, note: 'Room 101', createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 't2', type: 'EXPENSE', category: 'ELECTRICITY', business: 'HSH',
    wallet: 'HSH_CASH', amount: 8500, note: 'May bill', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 't3', type: 'INCOME', category: 'MINIBAR', business: 'HSH',
    wallet: 'HSH_CASH', amount: 450, note: 'Room 103', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 't4', type: 'EXPENSE', category: 'STAFF_MEAL', business: 'HSH',
    wallet: 'HSH_CASH', amount: 850, note: '', createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 't5', type: 'TRANSFER', category: null, business: 'HSH',
    wallet: 'HSH_GCASH', toWallet: 'HSH_CASH', amount: 5000, note: 'Move to cash',
    createdAt: new Date(Date.now() - 30 * 3600000).toISOString(),
  },
  {
    id: 't6', type: 'INCOME', category: 'ROOM_PAYMENT', business: 'TRZ',
    wallet: 'TRZ_CASH', amount: 3000, note: 'Room 205', createdAt: new Date(Date.now() - 32 * 3600000).toISOString(),
  },
  {
    id: 't7', type: 'EXPENSE', category: 'PAYROLL', business: 'HSH',
    wallet: 'HSH_CASH', amount: 25000, note: '1st half May', createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 't8', type: 'INCOME', category: 'WALK_IN', business: 'TRZ',
    wallet: 'TRZ_CASH', amount: 1800, note: '', createdAt: new Date(Date.now() - 50 * 3600000).toISOString(),
  },
  {
    id: 't9', type: 'EXPENSE', category: 'SUPPLIES', business: 'TRZ',
    wallet: 'TRZ_CASH', amount: 2200, note: 'Cleaning supplies', createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
  {
    id: 't10', type: 'EXPENSE', category: 'INTERNET', business: 'HSH',
    wallet: 'HSH_GCASH', amount: 2200, note: 'PLDT monthly', createdAt: new Date(Date.now() - 74 * 3600000).toISOString(),
  },
];

export const mockBills = [
  {
    id: 'b1', name: 'Electricity Bill', business: 'HSH', amount: 12300,
    dueDate: '2025-05-15', priority: 'CRITICAL', status: 'DUE', paidAmount: 0, daysLeft: 3,
  },
  {
    id: 'b2', name: 'Payroll (1st Half)', business: 'HSH', amount: 85000,
    dueDate: '2025-05-15', priority: 'CRITICAL', status: 'DUE', paidAmount: 0, daysLeft: 3,
  },
  {
    id: 'b3', name: 'Internet', business: 'HSH', amount: 2200,
    dueDate: '2025-05-18', priority: 'IMPORTANT', status: 'DUE', paidAmount: 0, daysLeft: 6,
  },
  {
    id: 'b4', name: 'Booking.com Remittance', business: 'HSH', amount: 45000,
    dueDate: '2025-05-20', priority: 'CRITICAL', status: 'DUE', paidAmount: 0, daysLeft: 8,
  },
  {
    id: 'b5', name: 'Water Bill', business: 'TRZ', amount: 3800,
    dueDate: '2025-05-22', priority: 'IMPORTANT', status: 'DUE', paidAmount: 0, daysLeft: 10,
  },
  {
    id: 'b6', name: 'Electricity Bill', business: 'TRZ', amount: 9500,
    dueDate: '2025-05-22', priority: 'CRITICAL', status: 'DUE', paidAmount: 0, daysLeft: 10,
  },
  {
    id: 'b7', name: 'Payroll (1st Half)', business: 'TRZ', amount: 42000,
    dueDate: '2025-05-15', priority: 'CRITICAL', status: 'OVERDUE', paidAmount: 0, daysLeft: -2,
  },
  {
    id: 'b8', name: 'BIR Tax Quarterly', business: 'HSH', amount: 15000,
    dueDate: '2025-05-25', priority: 'CRITICAL', status: 'DUE', paidAmount: 0, daysLeft: 13,
  },
  {
    id: 'b9', name: 'Internet', business: 'TRZ', amount: 1800,
    dueDate: '2025-05-20', priority: 'IMPORTANT', status: 'DUE', paidAmount: 0, daysLeft: 8,
  },
  {
    id: 'b10', name: 'Cleaning Supplies', business: 'TRZ', amount: 4500,
    dueDate: '2025-05-28', priority: 'FLEXIBLE', status: 'DUE', paidAmount: 0, daysLeft: 16,
  },
];

export const mockDailySummary = {
  date: new Date().toISOString().split('T')[0],
  openingCash: 113300,
  totalCashIn: 38450,
  totalCashOut: 16320,
  expectedCash: 125430,
  actualCash: 123000,
  shortage: -2430,
  byPaymentMethod: [
    { method: 'Cash', pct: 60, amount: 17070 },
    { method: 'GCash', pct: 25, amount: 7112 },
    { method: 'Maya', pct: 10, amount: 2845 },
    { method: 'Bank', pct: 5, amount: 1423 },
  ],
};

export const mockCalendarEvents = [
  { date: '2025-05-15', type: 'CRITICAL', label: 'Payroll (1st Half)', amount: 85000, business: 'HSH' },
  { date: '2025-05-15', type: 'CRITICAL', label: 'Electricity Bill', amount: 12300, business: 'HSH' },
  { date: '2025-05-18', type: 'IMPORTANT', label: 'Internet', amount: 2200, business: 'HSH' },
  { date: '2025-05-20', type: 'CRITICAL', label: 'Booking.com Remittance', amount: 45000, business: 'HSH' },
  { date: '2025-05-22', type: 'IMPORTANT', label: 'Water Bill', amount: 3800, business: 'TRZ' },
  { date: '2025-05-22', type: 'CRITICAL', label: 'Electricity Bill', amount: 9500, business: 'TRZ' },
  { date: '2025-05-25', type: 'CRITICAL', label: 'BIR Tax Quarterly', amount: 15000, business: 'HSH' },
  { date: '2025-05-28', type: 'FLEXIBLE', label: 'Cleaning Supplies', amount: 4500, business: 'TRZ' },
  { date: '2025-05-31', type: 'CRITICAL', label: 'Payroll (2nd Half)', amount: 85000, business: 'HSH' },
  { date: '2025-05-31', type: 'CRITICAL', label: 'Payroll (2nd Half)', amount: 42000, business: 'TRZ' },
];

export const mockSecurityDeposits = [
  { id: 'sd1', guest: 'Mr. Santos', room: '201', amount: 2000, wallet: 'HSH_CASH', status: 'HELD', date: '2025-05-10' },
  { id: 'sd2', guest: 'Ms. Reyes', room: '105', amount: 2000, wallet: 'HSH_CASH', status: 'HELD', date: '2025-05-11' },
  { id: 'sd3', guest: 'Mr. Cruz', room: '304', amount: 3000, wallet: 'TRZ_CASH', status: 'HELD', date: '2025-05-12' },
  { id: 'sd4', guest: 'Ms. Garcia', room: '202', amount: 2000, wallet: 'HSH_GCASH', status: 'HELD', date: '2025-05-13' },
];

// Derived calculations
export function computeTotals(balances) {
  const cashWallets = ['HSH_CASH', 'TRZ_CASH', 'PERS_CASH'];
  const realCash = cashWallets.reduce((sum, id) => sum + (balances[id] || 0), 0);
  const totalAll = Object.values(balances).reduce((sum, v) => sum + v, 0);
  const digital = totalAll - realCash;
  return { realCash, digital, totalAll };
}

export function computeHealthStatus(realCash, upcomingObligations) {
  const ratio = realCash / upcomingObligations;
  if (ratio >= 1.3) return 'SAFE';
  if (ratio >= 0.9) return 'WARNING';
  return 'SHORT';
}
