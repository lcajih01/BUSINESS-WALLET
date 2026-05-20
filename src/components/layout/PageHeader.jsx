import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, back = false, right = null, transparent = false }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-5 pt-14 pb-4"
      style={{ background: transparent ? 'transparent' : 'var(--color-cream)' }}
    >
      {back && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="tap flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: 'rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </motion.button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-tertiary)' }}>{subtitle}</p>
        )}
      </div>

      {right && <div className="flex-shrink-0">{right}</div>}
    </motion.div>
  );
}
