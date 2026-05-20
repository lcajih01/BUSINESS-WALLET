export const BUSINESSES = {
  HSH:      { id: 'HSH',      name: 'Home Stay Hotel',         short: 'HSH',      color: '#1E3A2F' },
  TRZ:      { id: 'TRZ',      name: 'The Resthouse Zamboanga', short: 'TRZ',      color: '#1A3A5C' },
  PERSONAL: { id: 'PERSONAL', name: 'Personal',                short: 'P',        color: '#7D5A0A' },
};

// 8 wallets: HSH(COH + BK Receivables), TRZ(COH + Receivables), Personal(Cash, Maya, GCash, Bank)
// isCash: true  → counts toward Real Cash on Hand
// isReceivable: true → date-gated; NOT counted until receiveDate arrives
export const WALLETS = [
  { id: 'HSH_COH',     business: 'HSH',      type: 'CASH',       name: 'Cash on Hand',   isCash: true,       color: 'wallet-forest' },
  { id: 'HSH_BK_RECV', business: 'HSH',      type: 'RECEIVABLE', name: 'BK Receivables', isReceivable: true, color: 'wallet-sky'    },
  { id: 'TRZ_COH',     business: 'TRZ',      type: 'CASH',       name: 'Cash on Hand',   isCash: true,       color: 'wallet-forest' },
  { id: 'TRZ_RECV',    business: 'TRZ',      type: 'RECEIVABLE', name: 'Receivables',    isReceivable: true, color: 'wallet-sky'    },
  { id: 'PERS_CASH',   business: 'PERSONAL', type: 'CASH',       name: 'Personal Cash',  isCash: true,       color: 'wallet-forest' },
  { id: 'PERS_MAYA',   business: 'PERSONAL', type: 'MAYA',       name: 'Maya',           color: 'wallet-amber'  },
  { id: 'PERS_GCASH',  business: 'PERSONAL', type: 'GCASH',      name: 'GCash',          color: 'wallet-sky'    },
  { id: 'PERS_BANK',   business: 'PERSONAL', type: 'BANK',       name: 'Bank',           color: 'wallet-slate'  },
];

export const WALLET_TYPE_ICONS = {
  CASH:       '💵',
  GCASH:      'G',
  MAYA:       'M',
  BANK:       '🏦',
  RECEIVABLE: '📋',
};

export const CATEGORIES = {
  INCOME: [
    { id: 'ROOM_PAYMENT', label: 'Room Payment', icon: '🏠' },
    { id: 'WALK_IN',      label: 'Walk-in',      icon: '🚶' },
    { id: 'BOOKING_COM',  label: 'Booking.com',  icon: '🌐' },
    { id: 'MINIBAR',      label: 'Minibar',      icon: '🍺' },
    { id: 'LAUNDRY',      label: 'Laundry',      icon: '👕' },
    { id: 'OTHER_INCOME', label: 'Other Income', icon: '💰' },
  ],
  EXPENSE: [
    { id: 'PAYROLL',       label: 'Payroll',       icon: '👥' },
    { id: 'ELECTRICITY',   label: 'Electricity',   icon: '⚡' },
    { id: 'WATER',         label: 'Water',         icon: '💧' },
    { id: 'INTERNET',      label: 'Internet',      icon: '📡' },
    { id: 'SUPPLIES',      label: 'Supplies',      icon: '🛒' },
    { id: 'MAINTENANCE',   label: 'Maintenance',   icon: '🔧' },
    { id: 'FUEL',          label: 'Fuel',          icon: '⛽' },
    { id: 'STAFF_MEAL',    label: 'Staff Meal',    icon: '🍱' },
    { id: 'TAXES',         label: 'Taxes',         icon: '📋' },
    { id: 'OTHER_EXPENSE', label: 'Other Expense', icon: '📌' },
  ],
};

export const QUICK_ACTIONS = [
  { id: 'room_payment', label: 'Room\nPayment', icon: '🏠', type: 'INCOME',   category: 'ROOM_PAYMENT' },
  { id: 'walk_in',      label: 'Walk-in',       icon: '🚶', type: 'INCOME',   category: 'WALK_IN'      },
  { id: 'electricity',  label: 'Electricity',   icon: '⚡', type: 'EXPENSE',  category: 'ELECTRICITY'  },
  { id: 'payroll',      label: 'Payroll',        icon: '👥', type: 'EXPENSE',  category: 'PAYROLL'      },
  { id: 'transfer',     label: 'Transfer',       icon: '↔️', type: 'TRANSFER'                          },
  { id: 'supplies',     label: 'Supplies',       icon: '🛒', type: 'EXPENSE',  category: 'SUPPLIES'     },
  { id: 'fuel',         label: 'Fuel',           icon: '⛽', type: 'EXPENSE',  category: 'FUEL'         },
  { id: 'internet',     label: 'Internet',       icon: '📡', type: 'EXPENSE',  category: 'INTERNET'     },
];

export const BILL_PRIORITIES = {
  CRITICAL:  { id: 'CRITICAL',  label: 'Critical',  color: '#C0392B', bg: '#FDECEA' },
  IMPORTANT: { id: 'IMPORTANT', label: 'Important', color: '#92680A', bg: '#FFF3CD' },
  FLEXIBLE:  { id: 'FLEXIBLE',  label: 'Flexible',  color: '#2471A3', bg: '#D6EAF8' },
};
