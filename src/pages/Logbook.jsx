import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import PageHeader from '../components/layout/PageHeader';
import TransactionItem from '../components/ui/TransactionItem';
import { formatDate } from '../lib/format';
import { CATEGORIES, WALLETS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';

const TYPE_FILTERS = [
  { id: 'ALL',      label: 'All'      },
  { id: 'INCOME',   label: 'Income'   },
  { id: 'EXPENSE',  label: 'Expense'  },
  { id: 'TRANSFER', label: 'Transfer' },
];

const ALL_CATS = [...(CATEGORIES.INCOME || []), ...(CATEGORIES.EXPENSE || [])];

const labelCls = {
  display: 'block', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--color-ink-tertiary)', marginBottom: 4,
};
const inputSt = {
  background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)',
  color: 'var(--color-ink)', borderRadius: 10, padding: '10px 12px',
  fontSize: 14, width: '100%', outline: 'none',
};

function groupByDate(transactions) {
  const groups = {};
  for (const tx of transactions) {
    const d         = new Date(tx.createdAt);
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let key;
    if (d.toDateString() === today.toDateString())          key = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    else key = formatDate(tx.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return groups;
}

function getWalletName(id) {
  return WALLETS.find(w => w.id === id)?.name || id;
}

export default function Logbook() {
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showSearch, setShowSearch] = useState(false);
  const [editTx,     setEditTx]     = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [confirm,    setConfirm]    = useState(null);

  const { transactions, editTransaction, deleteTransaction } = useAppStore();

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (tx.note     || '').toLowerCase().includes(q) ||
        (tx.category || '').toLowerCase().includes(q) ||
        (tx.business || '').toLowerCase().includes(q) ||
        (tx.room     || '').toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [transactions, search, typeFilter]);

  const groups = groupByDate(filtered);

  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({ amount: String(tx.amount), note: tx.note || '', category: tx.category || '' });
  };

  const handleDelete = (id) => {
    setConfirm({
      message: 'Delete this transaction? The wallet balance will be reversed.',
      confirmLabel: 'Delete',
      onConfirm: () => deleteTransaction(id),
    });
  };

  const saveEdit = () => {
    const amount = Number(editForm.amount);
    if (!amount || amount <= 0) return;
    editTransaction(editTx.id, {
      amount,
      note:     editForm.note,
      category: editForm.category || null,
    });
    setEditTx(null);
  };

  const TYPE_CFG = {
    INCOME:   { bg: '#EDF7F1', color: '#2E7D52' },
    EXPENSE:  { bg: '#FDECEA', color: '#C0392B' },
    TRANSFER: { bg: '#D6EAF8', color: '#2471A3' },
  };

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader
        title="Cash Logbook"
        right={
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowSearch(!showSearch)}
            className="tap w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: showSearch ? 'var(--color-forest-pale)' : 'rgba(0,0,0,0.05)' }}
          >
            {showSearch
              ? <X size={16} strokeWidth={2} style={{ color: 'var(--color-forest)' }} />
              : <Search size={16} strokeWidth={1.8} />
            }
          </motion.button>
        }
      />

      {/* Search bar */}
      <motion.div
        initial={false}
        animate={{ height: showSearch ? 'auto' : 0, opacity: showSearch ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden px-5 pb-2"
      >
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-ink-quaternary)' }} />
          <input
            className="input-base pl-10"
            placeholder="Search transactions, guest, room&hellip;"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus={showSearch}
          />
        </div>
      </motion.div>

      {/* Type filters */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TYPE_FILTERS.map(f => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setTypeFilter(f.id)}
            className="tap flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold"
            style={typeFilter === f.id ? {
              background: 'var(--color-forest)', color: 'white',
            } : {
              background: 'rgba(0,0,0,0.05)', color: 'var(--color-ink-tertiary)',
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Transaction groups */}
      <div className="px-4 space-y-4">
        {Object.keys(groups).length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">&#x1F50D;</p>
            <p className="font-semibold" style={{ color: 'var(--color-ink-secondary)' }}>No transactions found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-quaternary)' }}>Try adjusting your search or filter</p>
          </div>
        )}

        {Object.entries(groups).map(([date, txs], gi) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.04, duration: 0.24 }}
          >
            <p className="label-caps mb-2 px-1">{date}</p>
            <div className="card overflow-hidden">
              {txs.map((tx, i) => (
                <div
                  key={tx.id}
                  className="px-3"
                  style={i < txs.length - 1 ? { borderBottom: '1px solid var(--color-ink-faint)' } : {}}
                >
                  <TransactionItem
                    tx={tx}
                    showBusiness
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div style={{ height: 8 }} />
      </div>

      <ConfirmSheet
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />

      {/* ── Edit Transaction Sheet ── */}
      <AnimatePresence>
        {editTx && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setEditTx(null)}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ background: 'var(--color-surface)', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-ink-faint)' }} />
              </div>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-ink-faint)' }}>
                <p className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>Edit Transaction</p>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setEditTx(null)} className="tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-ink-faint)' }}>
                  <X size={15} strokeWidth={2} />
                </motion.button>
              </div>
              <div className="px-5 py-4 space-y-3">
                {/* Read-only context */}
                <div className="flex gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: (TYPE_CFG[editTx.type] || TYPE_CFG.EXPENSE).bg, color: (TYPE_CFG[editTx.type] || TYPE_CFG.EXPENSE).color }}>
                    {editTx.type}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'var(--color-cream)', color: 'var(--color-ink-tertiary)', border: '1px solid var(--color-ink-faint)' }}>
                    {getWalletName(editTx.wallet)}
                  </span>
                  {editTx.toWallet && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'var(--color-cream)', color: 'var(--color-ink-tertiary)', border: '1px solid var(--color-ink-faint)' }}>
                      → {getWalletName(editTx.toWallet)}
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label style={labelCls}>Amount (₱)</label>
                  <input
                    type="number"
                    min="0"
                    style={inputSt}
                    value={editForm.amount}
                    onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                  />
                </div>

                {/* Category (income/expense only) */}
                {editTx.type !== 'TRANSFER' && (
                  <div>
                    <label style={labelCls}>Category</label>
                    <select
                      style={inputSt}
                      value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                    >
                      <option value="">— None —</option>
                      {ALL_CATS.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label style={labelCls}>Note</label>
                  <input
                    type="text"
                    style={inputSt}
                    value={editForm.note}
                    onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Optional note"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={saveEdit}
                  className="tap w-full py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'var(--color-forest)' }}
                >
                  Save Changes
                </motion.button>
              </div>
              <div style={{ height: 24 }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
