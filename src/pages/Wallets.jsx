import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Clock, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { formatPeso, formatDate } from '../lib/format';
import { WALLETS, BUSINESSES, WALLET_TYPE_ICONS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import {
  getAvailableBalance, getReservedBalance,
  getRealCash, getPendingReceivableBalance, getAllReceivableBalance,
} from '../lib/engines/walletEngine';

const BIZ_FILTERS = ['All', 'HSH', 'TRZ', 'Personal'];

const WALLET_BG = {
  'wallet-forest': 'linear-gradient(135deg, #1E3A2F 0%, #2D5440 60%, #3A6B52 100%)',
  'wallet-sky':    'linear-gradient(135deg, #1A3A5C 0%, #1E5276 60%, #2471A3 100%)',
  'wallet-amber':  'linear-gradient(135deg, #7D5A0A 0%, #92680A 60%, #B8860B 100%)',
  'wallet-slate':  'linear-gradient(135deg, #2C2C3E 0%, #3A3A5C 60%, #4A4A6E 100%)',
};

const inputSt = {
  background: 'var(--color-surface)', border: '1px solid var(--color-ink-faint)',
  color: 'var(--color-ink)', borderRadius: 8, padding: '8px 10px',
  fontSize: 13, width: '100%', outline: 'none',
};

const RECV_EMPTY = { source: '', amount: '', receiveDate: '', notes: '' };

function RecvForm({ form, onChange, onSave, onCancel, saveLabel = 'Save' }) {
  return (
    <div className="space-y-2 p-3 rounded-xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)' }}>
      <input
        style={inputSt}
        placeholder="Source (e.g. Booking.com)"
        value={form.source}
        onChange={e => onChange({ ...form, source: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          style={inputSt}
          placeholder="Amount"
          value={form.amount}
          onChange={e => onChange({ ...form, amount: e.target.value })}
        />
        <input
          type="date"
          style={inputSt}
          value={form.receiveDate}
          onChange={e => onChange({ ...form, receiveDate: e.target.value })}
        />
      </div>
      <input
        style={inputSt}
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={e => onChange({ ...form, notes: e.target.value })}
      />
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onSave}
          className="tap flex-1 py-2 rounded-lg text-xs font-bold text-white"
          style={{ background: 'var(--color-forest)' }}
        >
          {saveLabel}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onCancel}
          className="tap px-4 py-2 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

function WalletCard({ wallet, state, onExpand, isExpanded, onAdd, onTransfer }) {
  const [editBal,    setEditBal]    = useState(false);
  const [balInput,   setBalInput]   = useState('');
  const [addRecvOpen, setAddRecvOpen] = useState(false);
  const [addForm,    setAddForm]    = useState(RECV_EMPTY);
  const [editRecvId, setEditRecvId] = useState(null);
  const [editForm,   setEditForm]   = useState(RECV_EMPTY);

  const balance   = state.walletBalances[wallet.id] || 0;
  const reserved  = getReservedBalance(state, wallet.id);
  const available = getAvailableBalance(state, wallet.id);
  const allRecv   = wallet.isReceivable ? getAllReceivableBalance(state, wallet.id) : 0;

  // All pending receivables for this wallet (no cap)
  const pendingRecvs = wallet.isReceivable
    ? (state.receivables || []).filter(r => r.walletId === wallet.id && r.status === 'PENDING')
    : [];

  const walletTx = (state.transactions || [])
    .filter(tx => tx.wallet === wallet.id || tx.toWallet === wallet.id)
    .slice(0, 3);

  const openEditRecv = (r) => {
    setEditRecvId(r.id);
    setAddRecvOpen(false);
    setEditForm({
      source:      r.source      || '',
      amount:      String(r.amount),
      receiveDate: r.receiveDate ? r.receiveDate.slice(0, 10) : '',
      notes:       r.notes       || '',
    });
  };

  const saveAdd = () => {
    const amount = Number(addForm.amount);
    if (!amount || !addForm.receiveDate) return;
    state.addReceivable({
      walletId:    wallet.id,
      business:    wallet.business,
      source:      addForm.source || 'Receivable',
      amount,
      receiveDate: addForm.receiveDate,
      notes:       addForm.notes,
    });
    setAddForm(RECV_EMPTY);
    setAddRecvOpen(false);
  };

  const saveEdit = () => {
    const amount = Number(editForm.amount);
    if (!amount || !editForm.receiveDate) return;
    state.editReceivable(editRecvId, {
      source:      editForm.source,
      amount,
      receiveDate: editForm.receiveDate,
      notes:       editForm.notes,
    });
    setEditRecvId(null);
  };

  const handleDeleteRecv = (id) => {
    if (window.confirm('Delete this receivable?')) {
      state.deleteReceivable(id);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 8px 28px rgba(0,0,0,0.08)' }}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onExpand(wallet.id)}
        className="tap w-full text-left block"
        style={{ background: WALLET_BG[wallet.color] || WALLET_BG['wallet-forest'] }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {WALLET_TYPE_ICONS[wallet.type] || '?'}
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {BUSINESSES[wallet.business]?.name || wallet.business}
                </p>
                <p className="text-white font-semibold text-sm">{wallet.name}</p>
              </div>
            </div>
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={18} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </motion.div>
          </div>

          {wallet.isReceivable ? (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Pending</p>
              <p className="display-number text-white" style={{ fontSize: 'clamp(22px, 6vw, 32px)' }}>
                {formatPeso(allRecv)}
              </p>
              {!isExpanded && (
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Not yet available &middot; date-gated
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Available Balance</p>
              <p className="display-number text-white" style={{ fontSize: 'clamp(22px, 6vw, 32px)' }}>
                {formatPeso(balance)}
              </p>
              {!isExpanded && reserved > 0 && (
                <div className="mt-3 pt-3 flex justify-between text-[11px]" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                  <span>Reserved: {formatPeso(reserved)}</span>
                  <span>Available: {formatPeso(available)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ background: 'var(--color-surface)', overflow: 'hidden' }}
          >
            <div className="p-4">
              {wallet.isReceivable ? (
                <>
                  {/* Receivable entries */}
                  <div className="mb-3 space-y-2">
                    {pendingRecvs.length === 0 && !addRecvOpen && (
                      <p className="text-sm text-center py-2" style={{ color: 'var(--color-ink-quaternary)' }}>
                        No pending receivables.
                      </p>
                    )}

                    {pendingRecvs.map(r => {
                      const dueDate    = new Date(r.receiveDate);
                      const isAvailable = dueDate <= new Date();

                      if (editRecvId === r.id) {
                        return (
                          <RecvForm
                            key={r.id}
                            form={editForm}
                            onChange={setEditForm}
                            onSave={saveEdit}
                            onCancel={() => setEditRecvId(null)}
                            saveLabel="Save"
                          />
                        );
                      }

                      return (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl"
                          style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)' }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
                                {r.source || 'Receivable'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock size={11} strokeWidth={2} style={{ color: isAvailable ? 'var(--color-forest)' : 'var(--color-amber)' }} />
                                <p className="text-xs" style={{ color: isAvailable ? 'var(--color-forest)' : 'var(--color-amber)' }}>
                                  {isAvailable ? 'Ready to receive' : dueDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              {r.notes && (
                                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-ink-quaternary)' }}>{r.notes}</p>
                              )}
                            </div>
                            <span className="font-bold text-sm tabular flex-shrink-0" style={{ color: 'var(--color-ink)' }}>
                              {formatPeso(r.amount)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1.5">
                            {isAvailable && (
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => state.markReceivableReceived(r.id)}
                                className="tap flex-1 text-[11px] font-bold py-1.5 rounded-lg text-white"
                                style={{ background: 'var(--color-forest)' }}
                              >
                                Receive → COH
                              </motion.button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEditRecv(r)}
                              className="tap flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                              style={{ background: 'var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
                            >
                              <Pencil size={10} strokeWidth={2} /> Edit
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteRecv(r.id)}
                              className="tap flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                              style={{ background: '#FDECEA', color: 'var(--color-ruby-light)' }}
                            >
                              <Trash2 size={10} strokeWidth={2} />
                            </motion.button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add form */}
                    {addRecvOpen && (
                      <RecvForm
                        form={addForm}
                        onChange={setAddForm}
                        onSave={saveAdd}
                        onCancel={() => { setAddRecvOpen(false); setAddForm(RECV_EMPTY); }}
                        saveLabel="Add"
                      />
                    )}
                  </div>

                  {/* Add button */}
                  {!addRecvOpen && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setAddRecvOpen(true); setEditRecvId(null); }}
                      className="tap w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--color-cream)', border: '1px dashed var(--color-ink-faint)', color: 'var(--color-ink-tertiary)' }}
                    >
                      <Plus size={13} strokeWidth={2.5} /> Add Receivable
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  {/* Balance breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Total',     val: balance,   color: 'var(--color-ink)'         },
                      { label: 'Reserved',  val: reserved,  color: 'var(--color-amber)'        },
                      { label: 'Available', val: available, color: 'var(--color-forest-light)' },
                    ].map(row => (
                      <div key={row.label} className="text-center p-2 rounded-xl" style={{ background: 'var(--color-cream)' }}>
                        <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--color-ink-quaternary)' }}>{row.label}</p>
                        <p className="font-bold text-sm tabular" style={{ color: row.color, letterSpacing: '-0.01em' }}>
                          {formatPeso(row.val)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2 mb-3">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={onAdd}
                      className="tap flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold text-white"
                      style={{ background: 'var(--color-forest)' }}
                    >
                      <ArrowDownLeft size={14} strokeWidth={2.5} /> Add
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={onTransfer}
                      className="tap flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold"
                      style={{ background: 'var(--color-cream)', border: '1.5px solid var(--color-ink-faint)', color: 'var(--color-ink)' }}
                    >
                      <ArrowUpRight size={14} strokeWidth={2.5} /> Transfer
                    </motion.button>
                  </div>

                  {/* Edit balance */}
                  {!editBal ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setBalInput(String(balance)); setEditBal(true); }}
                      className="tap w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold mb-3"
                      style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
                    >
                      <Pencil size={12} strokeWidth={2} /> Adjust Balance
                    </motion.button>
                  ) : (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="number"
                        value={balInput}
                        onChange={e => setBalInput(e.target.value)}
                        className="flex-1 rounded-xl px-3 py-2 text-sm"
                        style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)', color: 'var(--color-ink)', outline: 'none' }}
                        autoFocus
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { state.setWalletBalance(wallet.id, Number(balInput)); setEditBal(false); }}
                        className="tap w-9 h-9 flex items-center justify-center rounded-xl text-white flex-shrink-0"
                        style={{ background: 'var(--color-forest)' }}
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditBal(false)}
                        className="tap w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)' }}
                      >
                        <X size={14} strokeWidth={2} />
                      </motion.button>
                    </div>
                  )}
                </>
              )}

              {/* Recent activity */}
              {walletTx.length > 0 && (
                <>
                  <p className="label-caps mb-2">Recent Activity</p>
                  {walletTx.map((tx, i) => {
                    const isIn = tx.type === 'INCOME' || tx.toWallet === wallet.id;
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2"
                        style={i < walletTx.length - 1 ? { borderBottom: '1px solid var(--color-ink-faint)' } : {}}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                            {tx.category || tx.type}
                          </p>
                          {tx.note && (
                            <p className="text-xs" style={{ color: 'var(--color-ink-quaternary)' }}>{tx.note}</p>
                          )}
                        </div>
                        <span className={`font-bold text-sm tabular ${isIn ? 'text-in' : tx.type === 'TRANSFER' ? 'text-transfer' : 'text-out'}`}>
                          {isIn ? '+' : tx.type === 'TRANSFER' ? '' : '-'}{formatPeso(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Wallets() {
  const navigate    = useNavigate();
  const [filter, setFilter]         = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const state    = useAppStore();
  const realCash = getRealCash(state);

  const filtered = WALLETS.filter(w => {
    if (filter === 'All')      return true;
    if (filter === 'HSH')      return w.business === 'HSH';
    if (filter === 'TRZ')      return w.business === 'TRZ';
    if (filter === 'Personal') return w.business === 'PERSONAL';
    return true;
  });

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Wallets" subtitle={`${formatPeso(realCash)} real cash`} />

      <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {BIZ_FILTERS.map(f => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.94 }}
            onClick={() => { setFilter(f); setExpandedId(null); }}
            className="tap flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={filter === f ? {
              background: 'var(--color-forest)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(30,58,47,0.25)',
            } : {
              background: 'rgba(0,0,0,0.05)',
              color: 'var(--color-ink-tertiary)',
            }}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {filtered.map((wallet, i) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.24 }}
          >
            <WalletCard
              wallet={wallet}
              state={state}
              onExpand={toggleExpand}
              isExpanded={expandedId === wallet.id}
              onAdd={() => navigate('/add')}
              onTransfer={() => navigate('/transfers')}
            />
          </motion.div>
        ))}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
