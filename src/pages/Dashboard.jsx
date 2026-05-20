import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, ChevronRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import TransactionItem from '../components/ui/TransactionItem';
import { formatPeso } from '../lib/format';
import { BUSINESSES } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { getRealCash, getBusinessTotal, getTotalAll, getTodayCashFlow } from '../lib/engines/walletEngine';
import { computeDecision, getDaysLeft } from '../lib/engines/decisionEngine';

const BIZ_FILTERS = [
  { id: 'ALL',      label: 'All'      },
  { id: 'HSH',      label: 'HSH'      },
  { id: 'TRZ',      label: 'TRZ'      },
  { id: 'PERSONAL', label: 'Personal' },
];

function BizSummaryCard({ businessId, total, onPress }) {
  const biz = BUSINESSES[businessId];
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onPress}
      className="tap flex flex-col gap-1.5 p-3 rounded-2xl w-full min-w-0"
      style={{
        background: 'var(--color-surface)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
          style={{ background: biz.color }}
        >
          {biz.short}
        </span>
        <span className="text-[10px] font-medium truncate" style={{ color: 'var(--color-ink-tertiary)' }}>
          {biz.name}
        </span>
      </div>
      <span className="font-bold text-sm tabular truncate" style={{ color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
        {formatPeso(total)}
      </span>
      <span className="text-[10px] font-medium" style={{ color: 'var(--color-ink-quaternary)' }}>Available</span>
    </motion.button>
  );
}

function UpcomingBillRow({ bill }) {
  const daysLeft  = getDaysLeft(bill.dueDate);
  const isOverdue = daysLeft < 0;
  const daysText  = isOverdue
    ? `${Math.abs(daysLeft)}d overdue`
    : daysLeft === 0 ? 'Due today'
    : `${daysLeft} days left`;

  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={{ borderBottom: '1px solid var(--color-ink-faint)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{bill.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-tertiary)' }}>
          {daysText} &middot; {bill.business}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-bold text-sm tabular" style={{ color: 'var(--color-ruby-light)' }}>
          {formatPeso(bill.amount - (bill.paidAmount || 0))}
        </span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={isOverdue
            ? { background: 'var(--color-ruby-pale)',   color: 'var(--color-ruby)'   }
            : { background: 'var(--color-forest-pale)', color: 'var(--color-forest)' }
          }
        >
          {isOverdue ? 'OVERDUE' : 'DUE'}
        </span>
      </div>
    </div>
  );
}

const staggerContainer = { animate: { transition: { staggerChildren: 0.06 } } };
const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Dashboard() {
  const navigate   = useNavigate();
  const [activeBiz, setActiveBiz] = useState('ALL');

  const state      = useAppStore();
  const decision   = computeDecision(state);
  const { cashIn: todayCashIn, cashOut: todayCashOut } = getTodayCashFlow(state);
  const realCash   = decision.realCash;
  const hshTotal   = getBusinessTotal(state, 'HSH');
  const trzTotal   = getBusinessTotal(state, 'TRZ');
  const persTotal  = getBusinessTotal(state, 'PERSONAL');
  const totalAll   = getTotalAll(state);

  const urgentBills = state.bills
    .filter(b => {
      const days = getDaysLeft(b.dueDate);
      const remaining = b.amount - (b.paidAmount || 0);
      return remaining > 0 && (days <= 8 || days < 0);
    })
    .filter(b => activeBiz === 'ALL' || b.business === activeBiz)
    .slice(0, 3);

  const totalDue = state.bills
    .filter(b => (b.amount - (b.paidAmount || 0)) > 0)
    .reduce((s, b) => s + (b.amount - (b.paidAmount || 0)), 0);

  const recentTx = state.transactions
    .filter(t => activeBiz === 'ALL' || t.business === activeBiz)
    .slice(0, 5);

  // Projected ending: real cash + today's net (approximation)
  const expectedEnding = realCash;

  return (
    <div className="min-h-dvh" style={{ background: 'var(--color-cream)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div>
          <p className="label-caps">Business Wallet</p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="tap w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.05)' }}
          >
            <Bell size={18} strokeWidth={1.8} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/settings')}
            className="tap w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.05)' }}
          >
            <Settings size={18} strokeWidth={1.8} />
          </motion.button>
        </div>
      </div>

      {/* Business filter */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {BIZ_FILTERS.map(f => {
          const active = activeBiz === f.id;
          return (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveBiz(f.id)}
              className="tap flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold"
              style={active ? {
                background: 'var(--color-forest)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(30,58,47,0.25)',
              } : {
                background: 'rgba(0,0,0,0.05)',
                color: 'var(--color-ink-tertiary)',
              }}
            >
              {f.label}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="px-4 space-y-3"
      >
        {/* Hero card */}
        <motion.div variants={staggerItem}>
          <div
            className="relative overflow-hidden rounded-3xl p-5"
            style={{
              background: 'linear-gradient(140deg, #1E3A2F 0%, #2D5440 50%, #3A6B52 100%)',
              minHeight: 172,
            }}
          >
            <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', top: 20, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Real Cash on Hand
                  </p>
                  <p className="display-number text-white" style={{ fontSize: 'clamp(28px, 8vw, 38px)' }}>
                    {formatPeso(realCash)}
                  </p>
                </div>
                <StatusBadge status={decision.status} pulse size="sm" />
              </div>

              <div
                className="flex items-center gap-4 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
              >
                <div>
                  <p className="text-[11px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Cash Flow (Today)
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: '#7DDB9E' }}>
                      <TrendingUp size={12} strokeWidth={2.5} />
                      +{formatPeso(todayCashIn)}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>&middot;</span>
                    <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      -{formatPeso(todayCashOut)}
                    </span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Total Assets
                  </p>
                  <p className="text-sm font-bold tabular" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {formatPeso(totalAll)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>All wallets</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3 Business summary cards */}
        <motion.div variants={staggerItem} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="label-caps">Wallet Balances</p>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate('/wallets')}
              className="tap flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: 'var(--color-forest)' }}
            >
              See all <ChevronRight size={13} strokeWidth={2.5} />
            </motion.button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <BizSummaryCard businessId="HSH"      total={hshTotal}  onPress={() => navigate('/wallets')} />
            <BizSummaryCard businessId="TRZ"      total={trzTotal}  onPress={() => navigate('/wallets')} />
            <BizSummaryCard businessId="PERSONAL" total={persTotal} onPress={() => navigate('/wallets')} />
          </div>
        </motion.div>

        {/* Upcoming obligations */}
        <motion.div variants={staggerItem} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} strokeWidth={2} style={{ color: 'var(--color-ruby-light)' }} />
              <p className="label-caps" style={{ color: 'var(--color-ruby-light)' }}>Upcoming Obligations</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate('/bills')}
              className="tap flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: 'var(--color-forest)' }}
            >
              View all <ChevronRight size={13} strokeWidth={2.5} />
            </motion.button>
          </div>
          {urgentBills.length === 0 ? (
            <p className="text-sm py-2 text-center" style={{ color: 'var(--color-ink-quaternary)' }}>
              No urgent bills in this view.
            </p>
          ) : (
            urgentBills.map(b => <UpcomingBillRow key={b.id} bill={b} />)
          )}
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-ink-faint)' }}>
            <span className="text-sm" style={{ color: 'var(--color-ink-tertiary)' }}>Total Due</span>
            <span className="font-bold text-base tabular" style={{ color: 'var(--color-ruby-light)' }}>
              {formatPeso(totalDue)}
            </span>
          </div>
        </motion.div>

        {/* Recent transactions */}
        <motion.div variants={staggerItem} className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="label-caps">Recent Transactions</p>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate('/logbook')}
              className="tap flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: 'var(--color-forest)' }}
            >
              See all <ChevronRight size={13} strokeWidth={2.5} />
            </motion.button>
          </div>
          {recentTx.length === 0 && (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--color-ink-quaternary)' }}>
              No transactions yet.
            </p>
          )}
          {recentTx.map((tx, i) => (
            <div
              key={tx.id}
              style={i < recentTx.length - 1 ? { borderBottom: '1px solid var(--color-ink-faint)' } : {}}
            >
              <TransactionItem tx={tx} showBusiness={activeBiz === 'ALL'} />
            </div>
          ))}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/add')}
            className="tap w-full mt-3 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
            style={{ background: 'var(--color-forest)', boxShadow: '0 2px 8px rgba(30,58,47,0.25)' }}
          >
            <span className="text-lg leading-none">+</span> Add Entry
          </motion.button>
        </motion.div>

        <div style={{ height: 8 }} />
      </motion.div>
    </div>
  );
}
