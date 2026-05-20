import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, ReceiptText, MoreHorizontal } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',        icon: Home,          label: 'Home'    },
  { path: '/logbook', icon: BookOpen,       label: 'Logbook' },
  { path: '/add',     icon: null,           label: 'Add'     }, // center FAB
  { path: '/bills',   icon: ReceiptText,    label: 'Bills'   },
  { path: '/more',    icon: MoreHorizontal, label: 'More'    },
];

// Pure content component — no fixed/absolute positioning.
// AppShell owns the fixed container and glass background.
export default function BottomNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const current   = location.pathname;

  return (
    <div className="flex items-center justify-around px-2 h-[60px]">
      {NAV_ITEMS.map((item) => {

        /* ── Center FAB ── */
        if (item.path === '/add') {
          return (
            <motion.button
              key="add"
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate('/add')}
              className="tap relative -top-5 flex items-center justify-center w-14 h-14 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #1E3A2F 0%, #2D5440 100%)',
                boxShadow: '0 4px 20px rgba(30,58,47,0.45)',
              }}
            >
              <span
                className="text-white font-light leading-none select-none"
                style={{ fontSize: 26, marginTop: -2 }}
              >
                +
              </span>
              {current === '/add' && (
                <motion.div
                  layoutId="add-ring"
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid rgba(255,255,255,0.35)' }}
                />
              )}
            </motion.button>
          );
        }

        /* ── Regular tab ── */
        const Icon     = item.icon;
        const isActive =
          current === item.path ||
          (item.path !== '/' && current.startsWith(item.path));

        return (
          <motion.button
            key={item.path}
            whileTap={{ scale: 0.86 }}
            onClick={() => navigate(item.path)}
            className="tap flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-1"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.7}
                style={{
                  color: isActive ? 'var(--color-forest)' : 'var(--color-ink-quaternary)',
                  transition: 'color 0.18s',
                }}
              />
              {isActive && (
                <motion.div
                  layoutId={`nav-dot-${item.path}`}
                  className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-forest)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
            </div>
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? 'var(--color-forest)' : 'var(--color-ink-quaternary)',
                transition: 'color 0.18s',
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
