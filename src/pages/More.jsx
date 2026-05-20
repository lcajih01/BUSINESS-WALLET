import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, CalendarDays, Clock, Shield, Settings, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { formatPeso } from '../lib/format';
import { useAppStore } from '../store/useAppStore';
import { computeDecision } from '../lib/engines/decisionEngine';

const MENU_ITEMS = [
  { path: '/transfers', icon: ArrowLeftRight, label: 'Transfers',       sub: 'Move money between wallets',            color: '#2471A3', bg: '#D6EAF8' },
  { path: '/daily',    icon: Clock,          label: 'Daily Summary',    sub: "Today's cash performance",              color: '#2E7D52', bg: '#EDF7F1' },
  { path: '/calendar', icon: CalendarDays,   label: 'Cash Plan',        sub: 'Upcoming obligations & stress days',    color: '#D4920A', bg: '#FFF3CD' },
  { path: '/decision', icon: Shield,         label: 'Decision Center',  sub: 'Business health & recommendations',     color: '#7A1515', bg: '#FDECEA' },
  { path: '/settings', icon: Settings,       label: 'Settings',         sub: 'Wallets, categories, backup',           color: '#3A3A3C', bg: '#F2F2F7' },
];

export default function More() {
  const navigate = useNavigate();
  const state = useAppStore();
  const safeState = {
    ...state,
    bills:          state.bills          || [],
    transactions:   state.transactions   || [],
    deposits:       state.deposits       || [],
    receivables:    state.receivables    || [],
    walletBalances: state.walletBalances || {},
  };
  const decision = computeDecision(safeState);
  const { realCash, status } = decision;

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <div className="px-5 pt-14 pb-4">
        <p className="label-caps">Menu</p>
        <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>More</h1>
      </div>

      {/* Quick status */}
      <div className="px-5 mb-5">
        <div
          className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1E3A2F 0%, #2D5440 100%)' }}
        >
          <div>
            <p className="text-white/50 text-xs font-medium">Business Status</p>
            <StatusBadge status={status} pulse />
            <p className="text-white font-bold text-base mt-1.5 tabular">{formatPeso(realCash)}</p>
            <p className="text-white/40 text-xs">Real cash on hand</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/decision')}
            className="tap flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            Details <ChevronRight size={13} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 space-y-2.5">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.24 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className="tap w-full flex items-center gap-4 p-4 rounded-2xl text-left"
              style={{ background: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.bg }}
              >
                <Icon size={20} strokeWidth={1.8} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>{item.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-ink-quaternary)' }}>{item.sub}</p>
              </div>
              <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            </motion.button>
          );
        })}
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
