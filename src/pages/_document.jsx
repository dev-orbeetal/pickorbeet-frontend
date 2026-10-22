import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        {/* Favicon & App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme */}
        <meta name="theme-color" content="#141B4D" />
        <meta name="msapplication-TileColor" content="#141B4D" />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Pickorbeet" />
        <meta property="og:image" content="https://pickorbeet-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png" />
        <meta property="og:image:secure_url" content="https://pickorbeet-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PickOrbeet - Shop Smarter, Live Better" />
        <meta property="og:url" content="https://pickorbeet.com" />
        <meta property="og:title" content="PickOrbeet - Shop Smarter, Live Better" />
        <meta property="og:description" content="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products with fast delivery across Bangladesh." />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://pickorbeet-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png" />
        <meta name="twitter:title" content="PickOrbeet - Shop Smarter, Live Better" />
        <meta name="twitter:description" content="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products with fast delivery across Bangladesh." />

        {/* WhatsApp specific */}
        <meta property="og:locale" content="en_US" />
        <meta name="description" content="Shop electronics, fashion, home, beauty, and everyday essentials at PickOrbeet. Original products with fast delivery across Bangladesh." />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://server.pickorbeet.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
