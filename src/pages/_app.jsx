import { useEffect } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import store from '@/store/store';
import { getProfile, checkAuth } from '@/store/slices/authSlice';
import { fetchCategories } from '@/store/slices/productsSlice';
import { startNotificationSocket, stopNotificationSocket } from '@/lib/notifications';
import LoadingProvider from '@/components/loading/LoadingProvider';
import '@/styles/globals.css';
import '@/styles/notifications.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-playfair',
});

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

function AppHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch categories globally (needed by Header on all pages)
    dispatch(fetchCategories());

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        dispatch(checkAuth());
        dispatch(getProfile());
      }
    }
  }, [dispatch]);

  return children;
}

function NotificationLive() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      stopNotificationSocket();
      return undefined;
    }
    startNotificationSocket();
    return () => stopNotificationSocket();
  }, [isAuthenticated]);

  return null;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <div className={`${inter.variable} ${playfair.variable} font-sans`}>
      <LoadingProvider>
        <AppHydrator>
        <NotificationLive />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.pathname}
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
              background: '#ffffff',
              color: '#172033',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 10px 30px -12px rgba(23, 32, 51, 0.35)',
              border: '1px solid #E4E9F2',
            },
            success: {
              iconTheme: {
                primary: '#16835B',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </AppHydrator>
      </LoadingProvider>
      </div>
    </Provider>
  );
}
