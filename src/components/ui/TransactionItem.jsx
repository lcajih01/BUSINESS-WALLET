import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { formatPeso, formatDate } from '../../lib/format';
import { CATEGORIES, WALLETS } from '../../lib/constants';

const TYPE_CONFIG = {
  INCOME:   { sign: '+',    cls: 'text-in',       bg: '#EDF7F1', color: '#2E7D52' },
  EXPENSE:  { sign: '-',    cls: 'text-out',      bg: '#FDECEA', color: '#C0392B' },
  TRANSFER: { sign: 'xfer', cls: 'text-transfer', bg: '#D6EAF8', color: '#2471A3' },
  SEC_DEP:  { sign: 'dep',  cls: '',              bg: '#FFF3CD', color: '#92680A' },
};

const DEFAULT_ICON = '\u{1F4B8}';
const PIN_ICON     = '\u{1F4CC}';

function getCategoryInfo(type, categoryId) {
  if (!categoryId) return { label: type, icon: DEFAULT_ICON };
  const all = [...(CATEGORIES.INCOME || []), ...(CATEGORIES.EXPENSE || [])];
  return all.find(c => c.id === categoryId) || { label: categoryId, icon: PIN_ICON };
}

function getWalletName(walletId) {
  return WALLETS.find(w => w.id === walletId)?.name || walletId;
}

export default function TransactionItem({ tx, showBusiness = false, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.EXPENSE;
  const cat = getCategoryInfo(tx.type, tx.category);

  const isTransfer = tx.type === 'TRANSFER';
  const isDeposit  = tx.type === 'SEC_DEP';

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="tap flex flex-col gap-0 overflow-hidden cursor-pointer"
    >
      <div className="flex items-center gap-3 px-1 py-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl flex-shrink-0 text-lg"
          style={{ background: cfg.bg }}
        >
          {cat.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] truncate" style={{ color: 'var(--color-ink)' }}>
              {cat.label}
            </span>
            {tx.note && (
              <span className="text-xs truncate" style={{ color: 'var(--color-ink-tertiary)' }}>
                &middot; {tx.note}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--color-ink-quaternary)' }}>
              {formatDate(tx.createdAt, { relative: true })}
            </span>
            {showBusiness && (
              <>
                <span style={{ color: 'var(--color-ink-faint)' }}>&middot;</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-ink-tertiary)' }}>
                  {tx.business}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className={`font-bold text-[15px] tabular ${cfg.cls}`}>
            {isTransfer || isDeposit ? '' : cfg.sign}{formatPeso(tx.amount)}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-ink-quaternary)' }}>
            {getWalletName(tx.wallet).split(' ').slice(-1)[0]}
          </span>
        </div>

        <ChevronRight
          size={14}
          strokeWidth={2}
          className="flex-shrink-0 transition-transform"
          style={{
            color: 'var(--color-ink-faint)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mx-1 mb-2 rounded-xl p-3 text-sm space-y-1.5"
              style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)' }}
            >
              <Row label="Wallet"  value={getWalletName(tx.wallet)} />
              {tx.toWallet && <Row label="To" value={getWalletName(tx.toWallet)} />}
              <Row label="Amount" value={formatPeso(tx.amount)} />
              {tx.note && <Row label="Note" value={tx.note} />}
              <Row label="Type"   value={tx.type} />

              {/* Edit / Delete actions */}
              {(onEdit || onDelete) && (
                <div
                  className="flex gap-2 pt-2"
                  style={{ borderTop: '1px solid var(--color-ink-faint)' }}
                  onClick={e => e.stopPropagation()}
                >
                  {onEdit && (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => onEdit(tx)}
                      className="tap flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
                    >
                      <Pencil size={11} strokeWidth={2} /> Edit
                    </motion.button>
                  )}
                  {onDelete && (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => onDelete(tx.id)}
                      className="tap flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: '#FDECEA', color: 'var(--color-ruby-light)' }}
                    >
                      <Trash2 size={11} strokeWidth={2} /> Delete
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'var(--color-ink-quaternary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--color-ink-secondary)' }}>{value}</span>
    </div>
  );
}
