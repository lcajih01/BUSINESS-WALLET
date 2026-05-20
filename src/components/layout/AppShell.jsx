import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.08, ease: 'easeIn'  } },
};

export default function AppShell({ children }) {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-cream)' }}>

      {/* Scrollable content area — centered to 480px */}
      <div className="relative flex-1 w-full mx-auto" style={{ maxWidth: 480, background: 'var(--color-cream)' }}>
        {/* AnimatePresence without mode="wait" so enter and exit overlap — eliminates blank frame */}
        <AnimatePresence initial={false}>
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-dvh pb-nav"
            style={{ background: 'var(--color-cream)' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {/*
        Bottom nav: the outer div is fixed full-width and carries the glass/blur background.
        The inner centering div constrains nav content to 480px so it aligns with the content above.
      */}
      <div
        className="bottom-nav fixed bottom-0 left-0 right-0 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="w-full mx-auto" style={{ maxWidth: 480 }}>
          <BottomNav />
        </div>
      </div>

    </div>
  );
}
