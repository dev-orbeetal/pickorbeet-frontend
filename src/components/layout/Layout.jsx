import { useEffect } from 'react';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import SEO from '@/components/SEO';
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

export default function Layout({
  children,
  title,
  description,
  image,
  type,
  url,
  noindex,
  product,
  jsonLd,
}) {
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
      <SEO
        title={title}
        description={description}
        image={image}
        type={type}
        url={url}
        noindex={noindex}
        product={product}
        jsonLd={jsonLd}
      />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="flex min-h-screen flex-col bg-ice pb-[calc(4rem+1px+env(safe-area-inset-bottom))] lg:pb-0">
        <Header />
        <motion.main
          variants={mainVariants}
          initial="initial"
          animate="animate"
          className="flex-grow"
        >
          {children}
        </motion.main>
        <Footer />
        <MobileNav />
      </div>
    </>
  );
}
