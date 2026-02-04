import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import store from '@/store/store';
import '@/styles/globals.css';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.asPath}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <Toaster
        position="top-center"
        containerStyle={{
          top: 100,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(26, 26, 26, 0.98)',
            backdropFilter: 'blur(12px)',
            color: '#F5F0E6',
            padding: '16px 24px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#1A1A1A',
            },
            style: {
              background: 'rgba(26, 26, 26, 0.98)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: 'rgba(26, 26, 26, 0.98)',
            },
          },
        }}
      />
    </Provider>
  );
}
