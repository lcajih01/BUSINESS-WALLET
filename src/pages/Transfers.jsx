import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, History, CheckCircle2, ChevronDown } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { formatPeso } from '../lib/format';
import { WALLETS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { getAvailableBalance } from '../lib/engines/walletEngine';

const WALLET_BG = {
  'wallet-forest': '#1E3A2F',
  'wallet-sky':    '#1A3A5C',
  'wallet-amber':  '#7D5A0A',
  'wallet-slate':  '#2C2C3E',
};
const ICONS = { CASH: '💵', GCASH: 'G', MAYA: 'M', BANK: '🏦', RECEIVABLE: '📋' };

// Only non-receivable wallets can participate in transfers
const TRANSFER_WALLETS = WALLETS.filter(w => !w.isReceivable);

function WalletSelector({ label, value, onChange, excludeId, state }) {
  const [open, setOpen] = useState(false);
  const wallet  = TRANSFER_WALLETS.find(w => w.id === value);
  const balance = value ? getAvailableBalance(state, value) : null;

  return (
    <div className="relative flex-1">
      <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-ink-tertiary)' }}>
        {label}
      </label>

      <motion.button
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="tap w-full rounded-2xl p-4 text-left"
        style={wallet ? {
          background:  WALLET_BG[wallet.color] || '#1E3A2F',
          boxShadow:   '0 4px 16px rgba(0,0,0,0.20)',
        } : {
          background: 'var(--color-surface)',
          border:     '1.5px dashed var(--color-ink-faint)',
        }}
      >
        {wallet ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {ICONS[wallet.type] || '?'}
              </span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {wallet.name} &middot; {wallet.business}
              </span>
            </div>
            <p className="font-bold text-white tabular" style={{ fontSize: 20, letterSpacing: '-0.02em' }}>
              {formatPeso(balance)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Available</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-16 gap-1">
            <ChevronDown size={18} strokeWidth={1.8} style={{ color: 'var(--color-ink-quaternary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink-quaternary)' }}>{label}</p>
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y:  0 }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.14 }}
              className="absolute left-0 right-0 z-50 mt-2 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                boxShadow:  '0 8px 32px rgba(0,0,0,0.16)',
                border:     '1px solid var(--color-ink-faint)',
              }}
            >
              <div className="max-h-56 overflow-y-auto py-1">
                {TRANSFER_WALLETS.filter(w => w.id !== excludeId).map(w => (
                  <motion.button
                    key={w.id}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => { onChange(w.id); setOpen(false); }}
                    className="tap w-full text-left px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                          {w.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>{w.business}</p>
                      </div>
                      <p className="font-bold text-sm tabular" style={{ color: 'var(--color-ink-secondary)' }}>
                        {formatPeso(getAvailableBalance(state, w.id))}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Transfers() {
  const store = useAppStore();
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');
  const [amount,  setAmount]  = useState('');
  const [note,    setNote]    = useState('');
  const [success, setSuccess] = useState(false);

  const fromBalance = from ? getAvailableBalance(store, from) : 0;
  const parsedAmt   = parseFloat(amount) || 0;
  const valid       = from && to && parsedAmt > 0 && parsedAmt <= fromBalance;

  const handleTransfer = () => {
    if (!valid) return;
    store.addTransfer({ from, to, amount: parsedAmt, note });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFrom(''); setTo(''); setAmount(''); setNote('');
    }, 2200);
  };

  const recentTransfers = store.transactions.filter(t => t.type === 'TRANSFER').slice(0, 5);

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Transfer" subtitle="Move money between wallets" />

      <div className="px-5 space-y-5">

        {/* From / To */}
        <div>
          <p className="label-caps mb-3">From &rarr; To</p>
          <div className="flex items-center gap-3">
            <WalletSelector label="From Wallet" value={from} onChange={setFrom} excludeId={to}   state={store} />

            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(30,58,47,0.3)' }}
            >
              <ArrowRight size={16} strokeWidth={2.5} className="text-white" />
            </div>

            <WalletSelector label="To Wallet"   value={to}   onChange={setTo}   excludeId={from} state={store} />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg select-none" style={{ color: 'var(--color-ink-tertiary)' }}>
              &#x20B1;
            </span>
            <input
              className="input-base pl-8"
              placeholder="0.00"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
            />
          </div>
          {from && parsedAmt > fromBalance && parsedAmt > 0 && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-ruby-light)' }}>
              Insufficient balance. Available: {formatPeso(fromBalance)}
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-tertiary)' }}>
            Note (Optional)
          </label>
          <input
            className="input-base"
            placeholder="Move to physical cash, etc."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Transfer button */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.92, opacity: 0 }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'var(--color-forest-pale)' }}
            >
              <CheckCircle2 size={20} strokeWidth={2} style={{ color: 'var(--color-forest)' }} />
              <span className="font-bold" style={{ color: 'var(--color-forest)' }}>Transfer Complete</span>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              whileTap={{ scale: valid ? 0.97 : 1 }}
              onClick={handleTransfer}
              disabled={!valid}
              className="tap w-full py-4 rounded-2xl text-[15px] font-bold"
              style={{
                background: valid ? 'var(--color-forest)' : 'var(--color-ink-faint)',
                color:      valid ? 'white' : 'var(--color-ink-quaternary)',
                boxShadow:  valid ? '0 4px 16px rgba(30,58,47,0.3)' : 'none',
                transition: 'background 0.2s',
                cursor:     valid ? 'pointer' : 'not-allowed',
              }}
            >
              Transfer Now
            </motion.button>
          )}
        </AnimatePresence>

        {/* Recent transfers */}
        {recentTransfers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History size={14} strokeWidth={2} style={{ color: 'var(--color-ink-quaternary)' }} />
              <p className="label-caps">Recent Transfers</p>
            </div>
            <div className="card overflow-hidden">
              {recentTransfers.map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={i < recentTransfers.length - 1 ? { borderBottom: '1px solid var(--color-ink-faint)' } : {}}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--color-sky-pale)' }}>
                    ↔
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>
                      {WALLETS.find(w => w.id === tx.wallet)?.name || tx.wallet}
                      {' → '}
                      {WALLETS.find(w => w.id === tx.toWallet)?.name || tx.toWallet}
                    </p>
                    {tx.note && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>{tx.note}</p>
                    )}
                  </div>
                  <span className="font-bold text-sm tabular text-transfer flex-shrink-0">
                    {formatPeso(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
