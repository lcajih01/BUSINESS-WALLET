import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { formatPeso } from '../lib/format';
import { WALLETS, BUSINESSES, CATEGORIES, QUICK_ACTIONS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';

const TABS      = ['Income', 'Expense', 'Transfer', 'Sec. Dep'];
const TAB_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER', 'SEC_DEP'];

function QuickActionButton({ action, onPress }) {
  const palette = {
    INCOME:   { bg: '#EDF7F1', color: '#2E7D52' },
    EXPENSE:  { bg: '#FDECEA', color: '#C0392B' },
    TRANSFER: { bg: '#D6EAF8', color: '#2471A3' },
  };
  const c = palette[action.type] || palette.EXPENSE;
  return (
    <motion.button
      whileTap={{ scale: 0.91 }}
      onClick={() => onPress(action)}
      className="tap flex flex-col items-center gap-1.5 p-3 rounded-2xl flex-shrink-0"
      style={{ background: c.bg, minWidth: 70 }}
    >
      <span className="text-xl">{action.icon}</span>
      <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: c.color }}>
        {action.label}
      </span>
    </motion.button>
  );
}

function SelectField({ label, value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="tap input-base flex items-center justify-between text-left"
        style={{ color: value ? 'var(--color-ink)' : 'var(--color-ink-quaternary)' }}
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={16} strokeWidth={2} style={{ color: 'var(--color-ink-quaternary)' }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 right-0 z-50 mt-1 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid var(--color-ink-faint)',
              }}
            >
              <div className="max-h-52 overflow-y-auto py-1">
                {options.map(opt => {
                  const key = typeof opt === 'string' ? opt : opt.value;
                  const lbl = typeof opt === 'string' ? opt : opt.label;
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => { onChange(key); setOpen(false); }}
                      className="tap w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-2.5"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {opt.icon && <span>{opt.icon}</span>}
                      {lbl}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessOverlay({ amount, type, onDone }) {
  const typeLabel = { INCOME: 'Income Saved', EXPENSE: 'Expense Saved', TRANSFER: 'Transfer Done', SEC_DEP: 'Deposit Recorded' };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center modal-overlay"
      onClick={onDone}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 mx-8"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <CheckCircle2 size={56} strokeWidth={1.5} style={{ color: 'var(--color-forest)' }} />
        </motion.div>
        <div className="text-center">
          <p className="font-bold text-xl" style={{ color: 'var(--color-ink)' }}>
            {typeLabel[type] || 'Entry Saved'}
          </p>
          <p className="text-3xl font-bold mt-1 tabular" style={{ color: 'var(--color-forest)', letterSpacing: '-0.03em' }}>
            {formatPeso(amount)}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-quaternary)' }}>Tap to continue</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AddEntry() {
  const navigate   = useNavigate();
  const store      = useAppStore();

  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    business: '', wallet: '', toWallet: '', category: '',
    amount: '', note: '', room: '', guestName: '', receiveDate: '',
  });
  const [success,     setSuccess]     = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [savedType,   setSavedType]   = useState('INCOME');

  const type       = TAB_TYPES[activeTab];
  const isTransfer = type === 'TRANSFER';
  const isSecDep   = type === 'SEC_DEP';

  const businessOptions = Object.values(BUSINESSES).map(b => ({ value: b.id, label: b.name }));

  // Wallet options filtered by business and type
  const walletOptions = WALLETS
    .filter(w => {
      if (form.business && w.business !== form.business) return false;
      if (isTransfer) return !w.isReceivable; // no receivables in transfers
      if (isSecDep)   return !w.isReceivable; // no receivables for deposits
      return true;
    })
    .map(w => ({ value: w.id, label: w.name + (form.business ? '' : ` (${w.business})`) }));

  const toWalletOptions = walletOptions.filter(w => w.value !== form.wallet);

  const categoryOptions = CATEGORIES[type] || [];

  // Detect if selected wallet is a receivable wallet
  const selectedWallet = WALLETS.find(w => w.id === form.wallet);
  const isReceivableWallet = selectedWallet?.isReceivable;

  const applyQuickAction = (action) => {
    const idx = TAB_TYPES.indexOf(action.type);
    if (idx >= 0) setActiveTab(idx);
    setForm(f => ({ ...f, category: action.category || '' }));
  };

  const handleSave = () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;

    if (isTransfer) {
      if (!form.wallet || !form.toWallet) return;
      store.addTransfer({ from: form.wallet, to: form.toWallet, amount: amt, note: form.note });
    } else if (isSecDep) {
      if (!form.wallet) return;
      const depositWallet = WALLETS.find(w => w.id === form.wallet);
      store.addDeposit({
        business:    depositWallet?.business || 'HSH',
        guestName:   form.guestName || 'Guest',
        room:        form.room || '',
        amount:      amt,
        paymentType: depositWallet?.type || 'CASH',
        walletId:    form.wallet,
        notes:       form.note || '',
        checkIn:     new Date().toISOString(),
        checkOut:    null,
      });
    } else if (type === 'INCOME' && isReceivableWallet) {
      if (!form.receiveDate) return;
      store.addReceivable({
        walletId:    form.wallet,
        business:    selectedWallet.business,
        source:      form.note || form.category || 'Income',
        amount:      amt,
        receiveDate: new Date(form.receiveDate).toISOString(),
        notes:       form.note || '',
      });
    } else {
      // Regular INCOME or EXPENSE
      const derivedBusiness = form.business || selectedWallet?.business || 'HSH';
      store.addTransaction({
        type,
        business: derivedBusiness,
        wallet:   form.wallet,
        category: form.category || null,
        amount:   amt,
        note:     form.note || '',
        room:     form.room || '',
      });
    }

    setSavedAmount(amt);
    setSavedType(type);
    setSuccess(true);
  };

  const handleSuccessDone = () => {
    setSuccess(false);
    setForm({ business: '', wallet: '', toWallet: '', category: '', amount: '', note: '', room: '', guestName: '', receiveDate: '' });
  };

  const canSave = (() => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return false;
    if (isTransfer) return !!(form.wallet && form.toWallet);
    if (isSecDep)   return !!(form.wallet);
    if (type === 'INCOME' && isReceivableWallet) return !!(form.receiveDate);
    return true;
  })();

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100dvh' }}>
      <AnimatePresence>
        {success && <SuccessOverlay amount={savedAmount} type={savedType} onDone={handleSuccessDone} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div>
          <p className="label-caps">New Entry</p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
            Add Entry
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="tap w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.07)' }}
        >
          <X size={17} strokeWidth={2} />
        </motion.button>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-4">
        <p className="label-caps mb-2">Quick Actions</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {QUICK_ACTIONS.map(a => (
            <QuickActionButton key={a.id} action={a} onPress={applyQuickAction} />
          ))}
        </div>
      </div>

      {/* Type tabs */}
      <div className="px-5 mb-5">
        <div className="segment-track flex">
          {TABS.map((tab, i) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveTab(i); setForm(f => ({ ...f, wallet: '', toWallet: '', category: '' })); }}
              className="tap flex-1 py-2 rounded-lg text-sm font-semibold"
              style={activeTab === i ? {
                background: 'var(--color-surface)',
                color: 'var(--color-ink)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              } : {
                color: 'var(--color-ink-quaternary)',
              }}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div className="px-5 space-y-4">

        {/* Business filter (not for transfer) */}
        {!isTransfer && (
          <SelectField
            label="Business"
            value={businessOptions.find(o => o.value === form.business)?.label || ''}
            options={businessOptions}
            onChange={v => setForm(f => ({ ...f, business: v, wallet: '', toWallet: '' }))}
            placeholder="Select business (optional)"
          />
        )}

        {/* Category (not for transfer or sec dep) */}
        {!isTransfer && !isSecDep && (
          <SelectField
            label="Category"
            value={categoryOptions.find(c => c.id === form.category)?.label || ''}
            options={categoryOptions.map(c => ({ value: c.id, label: c.label, icon: c.icon }))}
            onChange={v => setForm(f => ({ ...f, category: v }))}
            placeholder="Select category"
          />
        )}

        {/* Wallet / From Wallet */}
        <SelectField
          label={isTransfer ? 'From Wallet' : isSecDep ? 'Received In' : 'Wallet'}
          value={WALLETS.find(w => w.id === form.wallet)?.name || ''}
          options={walletOptions}
          onChange={v => setForm(f => ({ ...f, wallet: v }))}
          placeholder={isTransfer ? 'Select source wallet' : 'Select wallet'}
        />

        {/* To Wallet (transfer only) */}
        {isTransfer && (
          <SelectField
            label="To Wallet"
            value={WALLETS.find(w => w.id === form.toWallet)?.name || ''}
            options={toWalletOptions}
            onChange={v => setForm(f => ({ ...f, toWallet: v }))}
            placeholder="Select destination wallet"
          />
        )}

        {/* Guest name (sec dep only) */}
        {isSecDep && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
              Guest Name
            </label>
            <input
              className="input-base"
              placeholder="e.g. Mr. Santos"
              value={form.guestName}
              onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
            />
          </div>
        )}

        {/* Room (income or sec dep) */}
        {(type === 'INCOME' || isSecDep) && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
              Room {isSecDep ? '' : '(Optional)'}
            </label>
            <input
              className="input-base"
              placeholder="e.g. 101"
              value={form.room}
              onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
            />
          </div>
        )}

        {/* Receive Date (for receivable wallet income) */}
        {type === 'INCOME' && isReceivableWallet && (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
              Expected Receive Date
            </label>
            <input
              type="date"
              className="input-base"
              value={form.receiveDate}
              onChange={e => setForm(f => ({ ...f, receiveDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--color-amber)' }}>
              Will not count as available cash until this date.
            </p>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg select-none"
              style={{ color: 'var(--color-ink-tertiary)' }}
            >
              &#x20B1;
            </span>
            <input
              className="input-base pl-8"
              placeholder="0.00"
              type="number"
              inputMode="decimal"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
            />
            {form.amount && parseFloat(form.amount) > 0 && (
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                style={{ color: 'var(--color-ink-quaternary)' }}
              >
                {formatPeso(parseFloat(form.amount))}
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
            Notes {isSecDep ? '(Optional)' : '(Optional)'}
          </label>
          <textarea
            className="input-base resize-none"
            placeholder={isSecDep ? 'Guest notes, damage remarks…' : 'Walk-in guest, supplier name, etc.'}
            rows={2}
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: canSave ? 0.97 : 1 }}
          onClick={handleSave}
          disabled={!canSave}
          className="tap w-full py-4 rounded-2xl text-[15px] font-bold mt-2"
          style={{
            background:  canSave ? 'linear-gradient(135deg, #1E3A2F 0%, #2D5440 100%)' : 'var(--color-ink-faint)',
            color:       canSave ? 'white' : 'var(--color-ink-quaternary)',
            boxShadow:   canSave ? '0 4px 16px rgba(30,58,47,0.3)' : 'none',
            transition:  'background 0.2s, box-shadow 0.2s',
            cursor:      canSave ? 'pointer' : 'not-allowed',
          }}
        >
          Save Entry
        </motion.button>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
