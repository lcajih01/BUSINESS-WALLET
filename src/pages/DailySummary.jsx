import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { formatPeso } from '../lib/format';
import { WALLETS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { getRealCash, getTodayCashFlow, getTodayIncomeByType } from '../lib/engines/walletEngine';

const BILLS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

const TYPE_LABELS = { CASH: 'Cash', GCASH: 'GCash', MAYA: 'Maya', BANK: 'Bank' };

function CashCounter({ onTotal }) {
  const [counts, setCounts] = useState({});
  const total = BILLS.reduce((s, b) => s + (counts[b] || 0) * b, 0);

  const update = (bill, delta) => {
    setCounts(c => {
      const next = Math.max(0, (c[bill] || 0) + delta);
      const updated = { ...c, [bill]: next };
      const newTotal = BILLS.reduce((s, b) => s + (updated[b] || 0) * b, 0);
      onTotal(newTotal);
      return updated;
    });
  };

  return (
    <div className="space-y-2">
      {BILLS.map(bill => (
        <div key={bill} className="flex items-center gap-3">
          <div
            className="flex-shrink-0 w-14 text-center py-1.5 rounded-xl text-sm font-bold"
            style={{ background: 'var(--color-forest-pale)', color: 'var(--color-forest)' }}
          >
            &#x20B1;{bill}
          </div>
          <div className="flex items-center gap-3 flex-1">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => update(bill, -1)}
              className="tap w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: 'var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
            >
              &minus;
            </motion.button>
            <span className="flex-1 text-center font-bold text-lg tabular" style={{ color: 'var(--color-ink)', minWidth: 32 }}>
              {counts[bill] || 0}
            </span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => update(bill, 1)}
              className="tap w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg text-white"
              style={{ background: 'var(--color-forest)' }}
            >
              +
            </motion.button>
          </div>
          <div className="w-20 text-right">
            <span className="font-semibold text-sm tabular" style={{ color: 'var(--color-ink-secondary)' }}>
              {counts[bill] ? formatPeso((counts[bill] || 0) * bill) : '&mdash;'}
            </span>
          </div>
        </div>
      ))}

      <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '2px solid var(--color-forest-pale)' }}>
        <span className="font-bold" style={{ color: 'var(--color-ink)' }}>Total Count</span>
        <span className="font-bold text-xl tabular" style={{ color: 'var(--color-forest)', letterSpacing: '-0.02em' }}>
          {formatPeso(total)}
        </span>
      </div>
    </div>
  );
}

export default function DailySummary() {
  const [showCounter, setShowCounter] = useState(false);
  const [counterTotal, setCounterTotal] = useState(0);
  const [actualCash, setActualCash]   = useState(null);

  const state = useAppStore();
  const { cashIn: totalCashIn, cashOut: totalCashOut } = getTodayCashFlow(state);
  const realCash      = getRealCash(state);
  const incomeByType  = getTodayIncomeByType(state);

  // Expected cash = current COH balance (already reflects all transactions)
  const expectedCash = realCash;
  // Opening cash = expected - today's net
  const openingCash  = expectedCash - totalCashIn + totalCashOut;

  const counted  = actualCash ?? expectedCash;
  const shortage = counted - expectedCash;
  const isShort  = shortage < 0;
  const isOver   = shortage > 0;

  const applyCount = () => {
    setActualCash(counterTotal);
    setShowCounter(false);
  };

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });

  // Build payment method breakdown from today's income
  const totalIncome = Object.values(incomeByType).reduce((s, v) => s + v, 0);
  const paymentMethods = Object.entries(incomeByType).map(([type, amount]) => ({
    method: TYPE_LABELS[type] || type,
    amount,
    pct: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
  }));

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Daily Summary" subtitle={dateLabel} />


      <div className="px-4 space-y-3">
        {/* Summary card */}
        <div className="card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Opening Cash',  value: openingCash,  color: 'var(--color-ink)' },
              { label: 'Expected Cash', value: expectedCash, color: 'var(--color-ink)' },
            ].map(row => (
              <div key={row.label} className="p-3 rounded-2xl" style={{ background: 'var(--color-cream)' }}>
                <p className="label-caps mb-1">{row.label}</p>
                <p className="font-bold text-lg tabular" style={{ color: row.color, letterSpacing: '-0.02em' }}>
                  {formatPeso(row.value)}
                </p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--color-ink-faint)', paddingTop: 12 }}>
            <div className="flex justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} strokeWidth={2.5} style={{ color: '#2E7D52' }} />
                <span className="text-sm" style={{ color: 'var(--color-ink-tertiary)' }}>Total Cash In</span>
              </div>
              <span className="font-bold text-sm text-in tabular">+{formatPeso(totalCashIn)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={14} strokeWidth={2.5} style={{ color: 'var(--color-ruby-light)' }} />
                <span className="text-sm" style={{ color: 'var(--color-ink-tertiary)' }}>Total Cash Out</span>
              </div>
              <span className="font-bold text-sm text-out tabular">-{formatPeso(totalCashOut)}</span>
            </div>
          </div>
        </div>

        {/* Actual cash count */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="label-caps">Actual Cash Count</p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCounter(!showCounter)}
              className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--color-forest-pale)', color: 'var(--color-forest)' }}
            >
              <Calculator size={13} strokeWidth={2} />
              {showCounter ? 'Close' : 'Count Cash'}
            </motion.button>
          </div>

          <motion.div
            initial={false}
            animate={{ height: showCounter ? 'auto' : 0, opacity: showCounter ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {showCounter && (
              <div className="mb-4">
                <CashCounter onTotal={setCounterTotal} />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={applyCount}
                  className="tap w-full mt-3 py-3 rounded-2xl text-sm font-bold text-white"
                  style={{ background: 'var(--color-forest)' }}
                >
                  Apply: {formatPeso(counterTotal)}
                </motion.button>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-ink-tertiary)' }}>Counted Amount</p>
              <p className="font-bold text-2xl tabular mt-0.5" style={{ color: 'var(--color-ink)', letterSpacing: '-0.03em' }}>
                {formatPeso(counted)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: isShort ? 'var(--color-ruby-light)' : isOver ? '#2E7D52' : 'var(--color-ink-quaternary)' }}>
                {isShort ? 'Shortage' : isOver ? 'Overage' : 'Exact'}
              </p>
              <p className="font-bold text-xl tabular mt-0.5" style={{ color: isShort ? 'var(--color-ruby-light)' : isOver ? '#2E7D52' : 'var(--color-ink-quaternary)', letterSpacing: '-0.02em' }}>
                {isShort ? '-' : isOver ? '+' : ''}{formatPeso(Math.abs(shortage))}
              </p>
            </div>
          </div>
        </div>

        {/* By payment method */}
        {paymentMethods.length > 0 && (
          <div className="card p-4">
            <p className="label-caps mb-3">By Payment Method (Today)</p>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div key={method.method}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{method.method}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-ink-quaternary)' }}>{method.pct}%</span>
                    </div>
                    <span className="font-bold text-sm tabular" style={{ color: 'var(--color-ink-secondary)' }}>
                      {formatPeso(method.amount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-ink-faint)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${method.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--color-forest)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paymentMethods.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-3xl mb-2">&#x1F4CA;</p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink-quaternary)' }}>
              No income transactions yet today.
            </p>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
