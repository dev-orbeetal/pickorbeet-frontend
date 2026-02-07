import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        {/* Favicon & App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />

        {/* Theme */}
        <meta name="theme-color" content="#8B2942" />
        <meta name="msapplication-TileColor" content="#8B2942" />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Zzuhana" />
        <meta property="og:image" content="https://zzuhana-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png" />
        <meta property="og:image:secure_url" content="https://zzuhana-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Zzuhana - Premium Clothing Store" />
        <meta property="og:url" content="https://zzuhana.com" />
        <meta property="og:title" content="Zzuhana - Premium Clothing Store" />
        <meta property="og:description" content="Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://zzuhana-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png" />
        <meta name="twitter:title" content="Zzuhana - Premium Clothing Store" />
        <meta name="twitter:description" content="Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh." />

        {/* WhatsApp specific */}
        <meta property="og:locale" content="en_US" />
        <meta name="description" content="Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh." />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://server.zzuhana.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
