import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Wallet, Tag, RefreshCcw, Database, ChevronRight, Info, RotateCcw, X, ClipboardList, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { BUSINESSES, WALLETS, CATEGORIES } from '../lib/constants';
import { formatPeso } from '../lib/format';
import { useAppStore } from '../store/useAppStore';
import { getAvailableBalance, getReservedBalance } from '../lib/engines/walletEngine';

// ── Shared bottom-sheet modal ─────────────────────────────────────────────────

function BottomModal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ background: 'var(--color-surface)', maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-ink-faint)' }} />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-ink-faint)' }}>
              <p className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>{title}</p>
              <motion.button whileTap={{ scale: 0.88 }} onClick={onClose} className="tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-ink-faint)' }}>
                <X size={15} strokeWidth={2} />
              </motion.button>
            </div>
            <div className="px-5 py-4">{children}</div>
            <div style={{ height: 24 }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────

function SettingsRow({ icon: Icon, iconBg, iconColor, label, sub, right, onPress, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onPress}
      className="tap w-full flex items-center gap-3 px-4 py-3.5 text-left"
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={17} strokeWidth={1.8} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-ink-quaternary)' }}>{sub}</p>}
      </div>
      {right || <ChevronRight size={15} strokeWidth={2} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />}
    </motion.button>
  );
}

function SectionCard({ title, children }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div>
      <p className="label-caps px-5 mb-2">{title}</p>
      <div className="card mx-4 overflow-hidden">
        {items.map((child, i) => (
          <div key={i} style={i < items.length - 1 ? { borderBottom: '1px solid var(--color-ink-faint)' } : {}}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail rows used inside modals ────────────────────────────────────────────

function DetailRow({ label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--color-ink-faint)' }}>
      <span className="text-sm" style={{ color: 'var(--color-ink-tertiary)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: valueColor || 'var(--color-ink)' }}>{value}</span>
    </div>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────

function csvCell(v) {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportTransactionsCSV(transactions) {
  const headers = ['Date', 'Type', 'Business', 'Wallet', 'To Wallet', 'Category', 'Amount', 'Note'];
  const rows = transactions.map(tx => [
    new Date(tx.createdAt).toLocaleDateString('en-CA'),
    tx.type,
    tx.business,
    tx.wallet,
    tx.toWallet || '',
    tx.category || '',
    tx.amount,
    tx.note || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Bill Management modal ─────────────────────────────────────────────────────

const FREQ_LABELS = {
  MONTHLY:   'Monthly',
  BIMONTHLY: 'Every 2 months',
  QUARTERLY: 'Quarterly',
  ANNUAL:    'Annual',
};

const PRIORITY_COLORS = {
  CRITICAL:  { bg: '#FDECEA', color: 'var(--color-ruby-light)' },
  IMPORTANT: { bg: '#FFF3CD', color: 'var(--color-amber)' },
  FLEXIBLE:  { bg: '#EDF7F1', color: '#2E7D52' },
};

const inputCls = {
  background:   'var(--color-cream)',
  border:       '1px solid var(--color-ink-faint)',
  color:        'var(--color-ink)',
  borderRadius: 10,
  padding:      '10px 12px',
  fontSize:     14,
  width:        '100%',
  outline:      'none',
};

const labelCls = {
  display:     'block',
  fontSize:    11,
  fontWeight:  600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color:       'var(--color-ink-tertiary)',
  marginBottom: 4,
};

const OT_EMPTY  = { name: '', amount: '', business: 'HSH', priority: 'IMPORTANT', dueDate: '', category: '' };
const REC_EMPTY = { name: '', amount: '', business: 'HSH', priority: 'IMPORTANT', frequency: 'MONTHLY', firstDueDate: '', category: '' };

function BillManagementModal({ open, onClose, store }) {
  const { addBill, addRecurringBill, generateNextBill, toggleRecurringBill, recurringBills = [] } = store;

  const [tab,     setTab]     = useState('ONE_TIME');
  const [otForm,  setOtForm]  = useState(OT_EMPTY);
  const [recForm, setRecForm] = useState(REC_EMPTY);
  const [otErr,   setOtErr]   = useState('');
  const [recErr,  setRecErr]  = useState('');

  const handleOneTimeSubmit = () => {
    if (!otForm.name.trim())  { setOtErr('Bill name is required.'); return; }
    if (!otForm.amount || Number(otForm.amount) <= 0) { setOtErr('Enter a valid amount.'); return; }
    if (!otForm.dueDate)      { setOtErr('Due date is required.'); return; }
    setOtErr('');
    addBill({
      name:        otForm.name.trim(),
      business:    otForm.business,
      amount:      Number(otForm.amount),
      priority:    otForm.priority,
      dueDate:     otForm.dueDate,
      category:    otForm.category || null,
      isRecurring: false,
    });
    setOtForm(OT_EMPTY);
  };

  const handleRecurringSubmit = () => {
    if (!recForm.name.trim())  { setRecErr('Bill name is required.'); return; }
    if (!recForm.amount || Number(recForm.amount) <= 0) { setRecErr('Enter a valid amount.'); return; }
    if (!recForm.firstDueDate) { setRecErr('First due date is required.'); return; }
    setRecErr('');
    const dayOfMonth = new Date(recForm.firstDueDate + 'T12:00:00').getDate();
    addRecurringBill({
      name:         recForm.name.trim(),
      business:     recForm.business,
      amount:       Number(recForm.amount),
      priority:     recForm.priority,
      frequency:    recForm.frequency,
      firstDueDate: recForm.firstDueDate,
      category:     recForm.category || null,
      dayOfMonth,
    });
    setRecForm(REC_EMPTY);
  };

  const businesses = Object.values(BUSINESSES);

  return (
    <BottomModal open={open} onClose={onClose} title="Bill Management">
      {/* Tab switcher */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ background: 'var(--color-cream)' }}
      >
        {[['ONE_TIME', 'One-time Bill'], ['RECURRING', 'Recurring Bill']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setOtErr(''); setRecErr(''); }}
            className="flex-1 py-2 rounded-lg text-sm font-semibold"
            style={{
              background:  tab === key ? 'var(--color-surface)' : 'transparent',
              color:       tab === key ? 'var(--color-ink)' : 'var(--color-ink-tertiary)',
              boxShadow:   tab === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition:  'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ONE_TIME' ? (
        /* ── One-time bill form ── */
        <div className="space-y-3">
          <div>
            <label style={labelCls}>Bill Name</label>
            <input
              style={inputCls}
              placeholder="e.g. Booking.com Remittance"
              value={otForm.name}
              onChange={e => setOtForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>Amount (₱)</label>
              <input
                type="number"
                min="0"
                style={inputCls}
                placeholder="0"
                value={otForm.amount}
                onChange={e => setOtForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelCls}>Due Date</label>
              <input
                type="date"
                style={inputCls}
                value={otForm.dueDate}
                onChange={e => setOtForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>Business</label>
              <select
                style={inputCls}
                value={otForm.business}
                onChange={e => setOtForm(f => ({ ...f, business: e.target.value }))}
              >
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelCls}>Priority</label>
              <select
                style={inputCls}
                value={otForm.priority}
                onChange={e => setOtForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="CRITICAL">Critical</option>
                <option value="IMPORTANT">Important</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelCls}>Category</label>
            <select
              style={inputCls}
              value={otForm.category}
              onChange={e => setOtForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">— None —</option>
              {CATEGORIES.EXPENSE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {otErr && (
            <p className="text-xs" style={{ color: 'var(--color-ruby-light)' }}>{otErr}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleOneTimeSubmit}
            className="tap w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--color-forest)', color: 'white' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Bill
          </motion.button>
        </div>
      ) : (
        /* ── Recurring bill form + templates list ── */
        <div className="space-y-3">
          <div>
            <label style={labelCls}>Bill Name</label>
            <input
              style={inputCls}
              placeholder="e.g. Electricity Bill"
              value={recForm.name}
              onChange={e => setRecForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>Amount (₱)</label>
              <input
                type="number"
                min="0"
                style={inputCls}
                placeholder="0"
                value={recForm.amount}
                onChange={e => setRecForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelCls}>First Due Date</label>
              <input
                type="date"
                style={inputCls}
                value={recForm.firstDueDate}
                onChange={e => setRecForm(f => ({ ...f, firstDueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>Business</label>
              <select
                style={inputCls}
                value={recForm.business}
                onChange={e => setRecForm(f => ({ ...f, business: e.target.value }))}
              >
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelCls}>Priority</label>
              <select
                style={inputCls}
                value={recForm.priority}
                onChange={e => setRecForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="CRITICAL">Critical</option>
                <option value="IMPORTANT">Important</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelCls}>Frequency</label>
            <select
              style={inputCls}
              value={recForm.frequency}
              onChange={e => setRecForm(f => ({ ...f, frequency: e.target.value }))}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="BIMONTHLY">Every 2 months</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ANNUAL">Annual</option>
            </select>
          </div>

          <div>
            <label style={labelCls}>Category</label>
            <select
              style={inputCls}
              value={recForm.category}
              onChange={e => setRecForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">— None —</option>
              {CATEGORIES.EXPENSE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {recErr && (
            <p className="text-xs" style={{ color: 'var(--color-ruby-light)' }}>{recErr}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRecurringSubmit}
            className="tap w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--color-forest)', color: 'white' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Recurring Bill
          </motion.button>

          {/* ── Existing recurring templates ── */}
          {recurringBills.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ borderTop: '1px solid var(--color-ink-faint)', paddingTop: 16 }}>
                <p className="label-caps mb-3">Active Templates</p>
                <div className="space-y-2">
                  {recurringBills.map(r => {
                    const pc = PRIORITY_COLORS[r.priority] || PRIORITY_COLORS.IMPORTANT;
                    return (
                      <div
                        key={r.id}
                        className="rounded-xl p-3"
                        style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: r.isActive ? 'var(--color-ink)' : 'var(--color-ink-quaternary)' }}>
                              {r.name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>
                              {r.business} &middot; {FREQ_LABELS[r.frequency]}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: pc.bg, color: pc.color }}
                            >
                              {r.priority.charAt(0) + r.priority.slice(1).toLowerCase()}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              onClick={() => toggleRecurringBill(r.id)}
                              className="tap"
                              title={r.isActive ? 'Pause template' : 'Resume template'}
                            >
                              {r.isActive
                                ? <ToggleRight size={22} strokeWidth={1.8} style={{ color: '#2E7D52' }} />
                                : <ToggleLeft  size={22} strokeWidth={1.8} style={{ color: 'var(--color-ink-faint)' }} />
                              }
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs" style={{ color: 'var(--color-ink-quaternary)' }}>Next bill due</p>
                            <p className="text-sm font-bold tabular" style={{ color: 'var(--color-ink)' }}>
                              {formatPeso(r.amount)} &middot; {r.nextDueDate}
                            </p>
                          </div>
                          {r.isActive && (
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => generateNextBill(r.id)}
                              className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: '#D6EAF8', color: '#2471A3' }}
                            >
                              <Plus size={12} strokeWidth={2.5} />
                              Generate Bill
                            </motion.button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </BottomModal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const navigate = useNavigate();
  const state    = useAppStore();
  const { walletBalances, transactions, bills, recurringBills, resetToSeed } = state;

  const [bizModal,     setBizModal]     = useState(null);
  const [walletModal,  setWalletModal]  = useState(null);
  const [catsOpen,     setCatsOpen]     = useState(false);
  const [billMgmtOpen, setBillMgmtOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all data to seed values? This cannot be undone.')) {
      resetToSeed();
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    exportTransactionsCSV(transactions);
  };

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Settings" />

      <div className="space-y-5">

        {/* Businesses */}
        <SectionCard title="Businesses">
          {Object.values(BUSINESSES).map(b => (
            <SettingsRow
              key={b.id}
              icon={Building2}
              iconBg="#D6E8DC"
              iconColor="var(--color-forest)"
              label={b.name}
              sub={`ID: ${b.id}`}
              onPress={() => setBizModal(b)}
            />
          ))}
        </SectionCard>

        {/* Wallets */}
        <SectionCard title="Wallets">
          {WALLETS.slice(0, 4).map(w => (
            <SettingsRow
              key={w.id}
              icon={Wallet}
              iconBg="#D6EAF8"
              iconColor="var(--color-sky-light)"
              label={`${w.business} · ${w.name}`}
              sub={formatPeso(walletBalances[w.id] || 0)}
              onPress={() => setWalletModal(w)}
            />
          ))}
          <SettingsRow
            icon={Wallet}
            iconBg="#D6EAF8"
            iconColor="var(--color-sky-light)"
            label="View All Wallets"
            sub={`${WALLETS.length} total`}
            onPress={() => navigate('/wallets')}
          />
        </SectionCard>

        {/* Categories & Bills */}
        <SectionCard title="Categories &amp; Bills">
          <SettingsRow
            icon={Tag}
            iconBg="#FFF3CD"
            iconColor="var(--color-amber)"
            label="Manage Categories"
            sub="Income and expense categories"
            onPress={() => setCatsOpen(true)}
          />
          <SettingsRow
            icon={ClipboardList}
            iconBg="#FFF3CD"
            iconColor="var(--color-amber)"
            label="Bill Management"
            sub={`${bills.length} bills · ${recurringBills.length} recurring templates`}
            onPress={() => setBillMgmtOpen(true)}
          />
          <SettingsRow
            icon={RefreshCcw}
            iconBg="#FFF3CD"
            iconColor="var(--color-amber)"
            label="Recurring Bills"
            sub="Electricity, payroll, internet…"
            onPress={() => navigate('/bills')}
          />
        </SectionCard>

        {/* Data */}
        <SectionCard title="Data &amp; Backup">
          <SettingsRow
            icon={Database}
            iconBg="#F2F2F7"
            iconColor="#3A3A3C"
            label="Export Data"
            sub={`${transactions.length} transactions as CSV`}
            onPress={handleExport}
          />
          <SettingsRow
            icon={RotateCcw}
            iconBg="#FDECEA"
            iconColor="var(--color-ruby-light)"
            label="Reset to Seed Data"
            sub="Restore demo balances and transactions"
            onPress={handleReset}
            right={
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-ruby-pale)', color: 'var(--color-ruby-light)' }}>
                Reset
              </span>
            }
          />
          <SettingsRow
            icon={Database}
            iconBg="#F2F2F7"
            iconColor="#3A3A3C"
            label="Connect Supabase"
            sub="Not connected — Phase 3"
            disabled
            right={
              <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-amber-pale)', color: 'var(--color-amber)' }}>
                Soon
              </span>
            }
          />
        </SectionCard>

        {/* About */}
        <div className="card mx-4 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(30,58,47,0.3)' }}>
              <Info size={17} strokeWidth={1.8} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Business Wallet</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>Phase 2 &middot; Local State Engine &middot; May 2026</p>
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* ── Business detail modal ── */}
      <BottomModal open={!!bizModal} onClose={() => setBizModal(null)} title="Business Details">
        {bizModal && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: bizModal.color }}>
                <span className="font-bold text-white text-lg">{bizModal.short}</span>
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--color-ink)' }}>{bizModal.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>Business entity</p>
              </div>
            </div>
            <DetailRow label="Business ID" value={bizModal.id} />
            <DetailRow label="Short Code"  value={bizModal.short} />
            <DetailRow label="Wallets"     value={WALLETS.filter(w => w.business === bizModal.id).length} />
          </div>
        )}
      </BottomModal>

      {/* ── Wallet detail modal ── */}
      <BottomModal open={!!walletModal} onClose={() => setWalletModal(null)} title="Wallet Details">
        {walletModal && (() => {
          const rawBal   = walletBalances[walletModal.id] || 0;
          const avail    = getAvailableBalance(state, walletModal.id);
          const reserved = getReservedBalance(state, walletModal.id);
          return (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-forest)' }}>
                  <Wallet size={20} strokeWidth={1.8} className="text-white" />
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--color-ink)' }}>{walletModal.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>{walletModal.business} &middot; {walletModal.type}</p>
                </div>
              </div>
              <DetailRow label="Wallet ID"   value={walletModal.id} />
              <DetailRow label="Balance"     value={formatPeso(rawBal)} />
              <DetailRow label="Reserved"    value={formatPeso(reserved)} valueColor={reserved > 0 ? 'var(--color-amber)' : undefined} />
              <DetailRow label="Available"   value={formatPeso(avail)}   valueColor="#2E7D52" />
              <DetailRow label="Cash wallet" value={walletModal.isCash       ? 'Yes' : 'No'} />
              <DetailRow label="Receivable"  value={walletModal.isReceivable ? 'Yes' : 'No'} />
            </div>
          );
        })()}
      </BottomModal>

      {/* ── Categories modal ── */}
      <BottomModal open={catsOpen} onClose={() => setCatsOpen(false)} title="Categories">
        <div className="space-y-4">
          <div>
            <p className="label-caps mb-2">Income</p>
            <div className="space-y-1">
              {CATEGORIES.INCOME.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2">
                  <span className="text-lg w-8 text-center">{c.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{c.label}</span>
                  <span className="ml-auto text-xs font-mono" style={{ color: 'var(--color-ink-quaternary)' }}>{c.id}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-ink-faint)', paddingTop: 12 }}>
            <p className="label-caps mb-2">Expense</p>
            <div className="space-y-1">
              {CATEGORIES.EXPENSE.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2">
                  <span className="text-lg w-8 text-center">{c.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{c.label}</span>
                  <span className="ml-auto text-xs font-mono" style={{ color: 'var(--color-ink-quaternary)' }}>{c.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BottomModal>

      {/* ── Bill Management modal ── */}
      <BillManagementModal
        open={billMgmtOpen}
        onClose={() => setBillMgmtOpen(false)}
        store={state}
      />
    </div>
  );
}
