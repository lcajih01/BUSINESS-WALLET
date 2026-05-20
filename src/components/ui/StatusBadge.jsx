import { motion } from 'framer-motion';

const CONFIG = {
  SAFE:    { label: 'SAFE',    cls: 'badge-safe',    dot: '#2E7D52' },
  WARNING: { label: 'WARNING', cls: 'badge-warning',  dot: '#92680A' },
  SHORT:   { label: 'SHORT',   cls: 'badge-short',    dot: '#C0392B' },
};

export default function StatusBadge({ status, pulse = false, size = 'sm' }) {
  const cfg = CONFIG[status] || CONFIG.SAFE;
  const pad = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]';

  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-widest ${pad} ${cfg.cls}`}
    >
      <span
        className={pulse ? 'pulse-dot' : ''}
        style={{
          width: size === 'lg' ? 7 : 6,
          height: size === 'lg' ? 7 : 6,
          borderRadius: '50%',
          background: cfg.dot,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </motion.span>
  );
}
