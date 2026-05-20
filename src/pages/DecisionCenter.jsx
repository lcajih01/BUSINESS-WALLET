import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { formatPeso } from '../lib/format';
import { BUSINESSES } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { computeDecision } from '../lib/engines/decisionEngine';
import { getTotalAll } from '../lib/engines/walletEngine';

const STATUS_CONFIG = {
  SAFE: {
    icon: ShieldCheck,
    headline: 'You are SAFE',
    sub: 'Continue normal operations.',
    bg: 'linear-gradient(135deg, #1E3A2F 0%, #2D5440 100%)',
    iconColor: '#7DDB9E',
    glow: 'rgba(46,125,82,0.3)',
  },
  WARNING: {
    icon: AlertTriangle,
    headline: 'Watch Your Cash',
    sub: 'Obligations are approaching. Monitor closely.',
    bg: 'linear-gradient(135deg, #7D5A0A 0%, #B8860B 100%)',
    iconColor: '#FFD166',
    glow: 'rgba(184,134,11,0.3)',
  },
  SHORT: {
    icon: XCircle,
    headline: 'Cash Shortage Risk',
    sub: 'Immediate action required.',
    bg: 'linear-gradient(135deg, #7A1515 0%, #C0392B 100%)',
    iconColor: '#FF8A80',
    glow: 'rgba(192,57,43,0.3)',
  },
};

const RECOMMENDATIONS = {
  SAFE: [
    { icon: '&#x2705;', text: 'You can cover all obligations.' },
    { icon: '&#x1F4C8;', text: 'Consider setting aside 20% of surplus for reserves.' },
    { icon: '&#x1F504;', text: 'Maintain current cash collection habits.' },
  ],
  WARNING: [
    { icon: '&#x26A1;', text: 'Prioritize collecting outstanding payments.' },
    { icon: '&#x2702;&#xFE0F;', text: 'Delay non-essential purchases this week.' },
    { icon: '&#x1F504;', text: 'TRZ can support HSH if needed via transfer.' },
  ],
  SHORT: [
    { icon: '&#x1F6A8;', text: 'Immediate collection drive required.' },
    { icon: '&#x1F3E6;', text: 'Consider drawing from Bank wallet to bridge gap.' },
    { icon: '&#x1F4F5;', text: 'Halt all non-critical expenses immediately.' },
    { icon: '&#x1F4DE;', text: 'Contact Booking.com for early remittance if possible.' },
  ],
};

function BusinessHealthCard({ business, realCash, obligations, status }) {
  const cfg = STATUS_CONFIG[status];
  const ratio = obligations > 0 ? Math.min(realCash / obligations, 1) : 1;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="label-caps">{business}</p>
          <p className="font-bold text-base mt-0.5" style={{ color: 'var(--color-ink)' }}>
            {BUSINESSES[business]?.name || business}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="px-4 pb-4">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--color-ink-tertiary)' }}>Cash available</span>
          <span className="font-bold tabular text-in">{formatPeso(realCash)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span style={{ color: 'var(--color-ink-tertiary)' }}>Obligations due</span>
          <span className="font-bold tabular text-out">{formatPeso(obligations)}</span>
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-ink-faint)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: status === 'SAFE' ? 'var(--color-forest-light)' : status === 'WARNING' ? 'var(--color-amber)' : 'var(--color-ruby-light)' }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-quaternary)' }}>
          {(ratio * 100).toFixed(0)}% coverage
        </p>
      </div>
    </div>
  );
}

export default function DecisionCenter() {
  const state = useAppStore();

  // Guard against stale/partial persisted state
  const safeState = {
    ...state,
    bills:          state.bills          || [],
    transactions:   state.transactions   || [],
    deposits:       state.deposits       || [],
    receivables:    state.receivables    || [],
    walletBalances: state.walletBalances || {},
  };

  const decision = computeDecision(safeState);
  const totalAll = getTotalAll(safeState);

  const { realCash, upcoming30, obligations, status, survivalDays } = decision;
  const cfg        = STATUS_CONFIG[status] || STATUS_CONFIG.SAFE;
  const StatusIcon = cfg.icon;
  const recs       = RECOMMENDATIONS[status] || RECOMMENDATIONS.SAFE;

  const stagger = {
    initial: { opacity: 0, y: 14 },
    animate: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.28 } }),
  };

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Decision Center" subtitle="Business health at a glance" />

      <div className="px-4 space-y-3">
        {/* Main status card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{ background: cfg.bg, boxShadow: `0 8px 32px ${cfg.glow}` }}
        >
          <div style={{ position: 'absolute', top: -50, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 350, damping: 20 }}
            >
              <StatusIcon size={52} strokeWidth={1.5} style={{ color: cfg.iconColor }} />
            </motion.div>

            <div>
              <StatusBadge status={status} pulse size="lg" />
              <p className="text-white font-bold text-2xl mt-3" style={{ letterSpacing: '-0.02em' }}>
                {cfg.headline}
              </p>
              <p className="text-white/60 text-sm mt-1">{cfg.sub}</p>
            </div>

            <div className="flex gap-6 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', width: '100%', justifyContent: 'center' }}>
              <div className="text-center">
                <p className="text-white/50 text-xs font-medium mb-0.5">Real Cash</p>
                <p className="text-white font-bold text-lg tabular" style={{ letterSpacing: '-0.02em' }}>{formatPeso(realCash)}</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
              <div className="text-center">
                <p className="text-white/50 text-xs font-medium mb-0.5">Survival Days</p>
                <p className="text-white font-bold text-lg tabular" style={{ letterSpacing: '-0.02em' }}>
                  {survivalDays >= 999 ? '∞' : `${survivalDays} days`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div custom={1} initial="initial" animate="animate" variants={stagger} className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={15} strokeWidth={2} style={{ color: 'var(--color-amber)' }} />
            <p className="label-caps" style={{ color: 'var(--color-amber)' }}>Recommendations</p>
          </div>
          <div className="space-y-3">
            {recs.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0" dangerouslySetInnerHTML={{ __html: rec.icon }} />
                <p className="text-sm" style={{ color: 'var(--color-ink-secondary)', lineHeight: 1.5 }}>{rec.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Financial overview */}
        <motion.div custom={2} initial="initial" animate="animate" variants={stagger}>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} strokeWidth={2} style={{ color: '#2E7D52' }} />
                <p className="label-caps">Real Cash</p>
              </div>
              <p className="font-bold text-xl tabular" style={{ color: '#2E7D52', letterSpacing: '-0.02em' }}>
                {formatPeso(realCash)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>Physical cash only</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown size={14} strokeWidth={2} style={{ color: 'var(--color-ruby-light)' }} />
                <p className="label-caps">Due (30d)</p>
              </div>
              <p className="font-bold text-xl tabular" style={{ color: 'var(--color-ruby-light)', letterSpacing: '-0.02em' }}>
                {formatPeso(upcoming30)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>Bills in 30 days</p>
            </div>
          </div>
        </motion.div>

        {/* Per-business health */}
        <motion.div custom={3} initial="initial" animate="animate" variants={stagger}>
          <p className="label-caps mb-2 px-1">Business Health</p>
          <div className="space-y-2.5">
            <BusinessHealthCard business="HSH" realCash={decision.HSH.cash} obligations={decision.HSH.due} status={decision.HSH.status} />
            <BusinessHealthCard business="TRZ" realCash={decision.TRZ.cash} obligations={decision.TRZ.due} status={decision.TRZ.status} />
          </div>
        </motion.div>

        {/* Net position */}
        <motion.div custom={4} initial="initial" animate="animate" variants={stagger} className="card p-4">
          <p className="label-caps mb-3">Net Position</p>
          <div className="space-y-2.5">
            {[
              { label: 'Total Assets',      value: totalAll,              color: 'var(--color-ink)',        sign: ''  },
              { label: 'Total Obligations', value: obligations,           color: 'var(--color-ruby-light)', sign: '-' },
              { label: 'Net Position',      value: totalAll - obligations, color: totalAll > obligations ? '#2E7D52' : 'var(--color-ruby-light)', sign: '' },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between py-2 ${i === 2 ? 'border-t-2 mt-1' : ''}`}
                style={i === 2 ? { borderColor: 'var(--color-ink-faint)' } : {}}
              >
                <span className={`text-sm ${i === 2 ? 'font-bold' : 'font-medium'}`} style={{ color: i === 2 ? 'var(--color-ink)' : 'var(--color-ink-secondary)' }}>
                  {row.label}
                </span>
                <span className={`tabular font-bold ${i === 2 ? 'text-lg' : 'text-base'}`} style={{ color: row.color, letterSpacing: '-0.02em' }}>
                  {row.sign}{formatPeso(Math.abs(row.value))}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
