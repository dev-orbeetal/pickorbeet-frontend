import { useEffect } from 'react';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import { fetchCart } from '@/store/slices/cartSlice';
import { getProfile, checkAuth } from '@/store/slices/authSlice';

export default function Layout({ children, title = 'Zzuhana - Premium Clothing Store' }) {
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
