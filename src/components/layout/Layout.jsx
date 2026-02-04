import { useEffect } from 'react';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { fetchCart } from '@/store/slices/cartSlice';
import { getProfile, checkAuth } from '@/store/slices/authSlice';

const mainVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    }
  },
};

export default function Layout({ children, title = 'Zzuhana - Premium Clothing Store', description = 'Your destination for premium quality clothing. Discover the latest fashion trends with exceptional quality.' }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(checkAuth());

    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#cb4539" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <motion.main
          variants={mainVariants}
          initial="initial"
          animate="animate"
          className="flex-grow pt-16 md:pt-20"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </>
  );
}
