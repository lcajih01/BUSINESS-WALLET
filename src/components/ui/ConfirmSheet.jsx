import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mobile-safe confirmation bottom sheet.
 * Replaces window.confirm() throughout the app.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *   setConfirm({ message: '...', confirmLabel: 'Delete', onConfirm: () => doAction() });
 *   <ConfirmSheet
 *     message={confirm?.message}
 *     confirmLabel={confirm?.confirmLabel}
 *     onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
 *     onCancel={() => setConfirm(null)}
 *   />
 */
export default function ConfirmSheet({ message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {message && (
        <>
          <motion.div
            key="confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.45)', zIndex: 60 }}
            onClick={onCancel}
          />
          <motion.div
            key="confirm-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 42 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl px-5 pt-4 pb-8"
            style={{ background: 'var(--color-surface)', zIndex: 70 }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--color-ink-faint)' }} />
            <p className="text-sm font-medium text-center mb-6" style={{ color: 'var(--color-ink-secondary)', lineHeight: 1.55 }}>
              {message}
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onCancel}
                className="tap flex-1 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: 'var(--color-ink-faint)', color: 'var(--color-ink-secondary)' }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onConfirm}
                className="tap flex-1 py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: 'var(--color-ruby-light)' }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
