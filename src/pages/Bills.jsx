import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import PageHeader from '../components/layout/PageHeader';
import { formatPeso } from '../lib/format';
import { BUSINESSES, BILL_PRIORITIES, CATEGORIES } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { getBillStatus, getBillRemaining, getDaysLeft } from '../lib/engines/decisionEngine';

const STATUS_FILTERS = [
  { id: 'ALL',     label: 'All'     },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'DUE',     label: 'Due'     },
  { id: 'PAID',    label: 'Paid'    },
];

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

function BillCard({ bill, onPay, onUnpay, onEdit, onDelete }) {
  const status    = getBillStatus(bill);
  const daysLeft  = getDaysLeft(bill.dueDate);
  const remaining = getBillRemaining(bill);
  const isPaid    = status === 'PAID';
  const isOverdue = status === 'OVERDUE';
  const priority  = BILL_PRIORITIES[bill.priority];

  const statusIcon = isPaid
    ? <CheckCircle2 size={16} strokeWidth={2} style={{ color: '#2E7D52' }} />
    : isOverdue
      ? <AlertTriangle size={16} strokeWidth={2} style={{ color: 'var(--color-ruby-light)' }} />
      : <Clock size={16} strokeWidth={1.8} style={{ color: 'var(--color-amber)' }} />;

  const daysText = isPaid ? 'Paid'
    : daysLeft < 0  ? `${Math.abs(daysLeft)}d overdue`
    : daysLeft === 0 ? 'Due today'
    : `${daysLeft} days left`;

  const borderColor = isOverdue ? 'rgba(192,57,43,0.2)'
    : isPaid ? 'rgba(46,125,82,0.2)'
    : 'var(--color-ink-faint)';

  return (
    <div
      className="bg-white rounded-2xl p-4"
      style={{ border: `1.5px solid ${borderColor}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {statusIcon}
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-ink)' }}>
              {bill.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: priority.bg, color: priority.color }}
            >
              {priority.label}
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-ink-tertiary)' }}>
              {bill.business}
            </span>
            <span
              className="text-xs"
              style={{ color: isOverdue ? 'var(--color-ruby-light)' : 'var(--color-ink-quaternary)' }}
            >
              &middot; {daysText}
            </span>
            {status === 'PARTIAL' && (
              <span className="text-xs font-semibold" style={{ color: 'var(--color-amber)' }}>
                &middot; Partial ({formatPeso(bill.paidAmount)} paid)
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className="font-bold text-base tabular"
            style={{ color: isPaid ? '#2E7D52' : 'var(--color-ink)', letterSpacing: '-0.02em' }}
          >
            {formatPeso(remaining > 0 ? remaining : bill.amount)}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => isPaid ? onUnpay(bill.id) : onPay(bill.id)}
            className="tap px-3 py-1.5 rounded-xl text-xs font-bold"
            style={isPaid ? {
              background: 'var(--color-cream)', color: 'var(--color-ink-tertiary)',
              border: '1px solid var(--color-ink-faint)',
            } : {
              background: 'var(--color-forest)', color: 'white',
            }}
          >
            {isPaid ? 'Void' : 'Mark Paid'}
          </motion.button>
        </div>
      </div>

      {/* Edit / Delete row */}
      <div className="flex gap-2 mt-3 pt-2.5" style={{ borderTop: '1px solid var(--color-ink-faint)' }}>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onEdit(bill)}
          className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--color-cream)', border: '1px solid var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
        >
          <Pencil size={11} strokeWidth={2} /> Edit
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onDelete(bill.id)}
          className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: '#FDECEA', color: 'var(--color-ruby-light)' }}
        >
          <Trash2 size={11} strokeWidth={2} /> Delete
        </motion.button>
      </div>
    </div>
  );
}

const BILL_EMPTY = { name: '', amount: '', business: 'HSH', priority: 'IMPORTANT', dueDate: '', category: '' };

export default function Bills() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editBill,     setEditBill]     = useState(null);
  const [editForm,     setEditForm]     = useState(BILL_EMPTY);
  const [confirm,      setConfirm]      = useState(null);

  const { bills, payBill, markBillUnpaid, editBill: storEditBill, deleteBill } = useAppStore();

  const enriched = bills.map(b => ({
    ...b,
    _status: getBillStatus(b),
    _days:   getDaysLeft(b.dueDate),
  }));

  const filtered = enriched.filter(b => {
    if (statusFilter === 'ALL')     return true;
    if (statusFilter === 'PAID')    return b._status === 'PAID';
    if (statusFilter === 'OVERDUE') return b._status === 'OVERDUE';
    if (statusFilter === 'DUE')     return b._status !== 'PAID' && b._status !== 'OVERDUE';
    return true;
  });

  const totalRemaining = enriched.filter(b => b._status !== 'PAID').reduce((s, b) => s + getBillRemaining(b), 0);
  const overdueCount   = enriched.filter(b => b._status === 'OVERDUE').length;

  const openEdit = (bill) => {
    setEditBill(bill);
    setEditForm({
      name:     bill.name,
      amount:   String(bill.amount),
      business: bill.business,
      priority: bill.priority,
      dueDate:  bill.dueDate ? bill.dueDate.slice(0, 10) : '',
      category: bill.category || '',
    });
  };

  const handleDelete = (id) => {
    setConfirm({
      message: 'Delete this bill? This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: () => deleteBill(id),
    });
  };

  const saveEdit = () => {
    const amount = Number(editForm.amount);
    if (!editForm.name.trim() || !amount || amount <= 0 || !editForm.dueDate) return;
    storEditBill(editBill.id, {
      name:     editForm.name.trim(),
      amount,
      business: editForm.business,
      priority: editForm.priority,
      dueDate:  editForm.dueDate,
      category: editForm.category || null,
    });
    setEditBill(null);
  };

  const businesses = Object.values(BUSINESSES);

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Bills &amp; Payables" />

      {/* Summary */}
      <div className="px-5 mb-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="label-caps">Total Due</p>
              <p className="font-bold text-2xl mt-1 tabular" style={{ color: 'var(--color-ruby-light)', letterSpacing: '-0.03em' }}>
                {formatPeso(totalRemaining)}
              </p>
            </div>
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'var(--color-ruby-pale)' }}>
                <AlertTriangle size={13} strokeWidth={2.5} style={{ color: 'var(--color-ruby-light)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--color-ruby)' }}>
                  {overdueCount} overdue
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Critical',  count: bills.filter(b => b.priority === 'CRITICAL').length,  color: 'var(--color-ruby)'      },
              { label: 'Important', count: bills.filter(b => b.priority === 'IMPORTANT').length, color: 'var(--color-amber)'     },
              { label: 'Flexible',  count: bills.filter(b => b.priority === 'FLEXIBLE').length,  color: 'var(--color-sky-light)' },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center p-2 rounded-xl" style={{ background: 'var(--color-cream)' }}>
                <p className="font-bold text-lg" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {STATUS_FILTERS.map(f => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setStatusFilter(f.id)}
            className="tap flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold"
            style={statusFilter === f.id ? {
              background: 'var(--color-forest)', color: 'white',
            } : {
              background: 'rgba(0,0,0,0.05)', color: 'var(--color-ink-tertiary)',
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Bills list */}
      <div className="px-4 space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">&#x2705;</p>
            <p className="font-semibold" style={{ color: 'var(--color-ink-secondary)' }}>
              {statusFilter === 'PAID' ? 'No paid bills yet' : 'No bills in this category'}
            </p>
          </div>
        )}
        {filtered.map((bill, i) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <BillCard
              bill={bill}
              onPay={id => payBill(id, bill.amount - (bill.paidAmount || 0))}
              onUnpay={markBillUnpaid}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
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

      {/* ── Edit Bill Sheet ── */}
      <AnimatePresence>
        {editBill && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setEditBill(null)}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ background: 'var(--color-surface)', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-ink-faint)' }} />
              </div>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-ink-faint)' }}>
                <p className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>Edit Bill</p>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setEditBill(null)} className="tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-ink-faint)' }}>
                  <X size={15} strokeWidth={2} />
                </motion.button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label style={labelCls}>Bill Name</label>
                  <input style={inputSt} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelCls}>Amount (₱)</label>
                    <input type="number" min="0" style={inputSt} value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelCls}>Due Date</label>
                    <input type="date" style={inputSt} value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelCls}>Business</label>
                    <select style={inputSt} value={editForm.business} onChange={e => setEditForm(f => ({ ...f, business: e.target.value }))}>
                      {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelCls}>Priority</label>
                    <select style={inputSt} value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}>
                      <option value="CRITICAL">Critical</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="FLEXIBLE">Flexible</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelCls}>Category</label>
                  <select style={inputSt} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">— None —</option>
                    {CATEGORIES.EXPENSE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
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
