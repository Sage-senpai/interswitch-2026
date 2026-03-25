import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Primary Meta */}
        <title>Purse — Financial Empowerment for Nigerian Women</title>
        <meta name="description" content="AI-powered financial literacy, micro-savings, and secure payments. Built for every Nigerian woman ready to take control of her finances." />
        <meta name="author" content="Purse Team — Enyata x Interswitch Buildathon 2026" />
        <meta name="theme-color" content="#7E57C2" />

        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://purse-app-zeta.vercel.app" />
        <meta property="og:title" content="Purse — Financial Empowerment for Nigerian Women" />
        <meta property="og:description" content="AI-powered financial literacy, micro-savings, and secure payments. Interswitch-powered. Blockchain-verified. Free forever." />
        <meta property="og:image" content="https://purse-app-zeta.vercel.app/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Purse — Financial Empowerment for Nigerian Women" />
        <meta name="twitter:description" content="AI-powered financial literacy, micro-savings, and secure payments for Nigerian women." />
        <meta name="twitter:image" content="https://purse-app-zeta.vercel.app/og-image.png" />

        {/* Expo scroll reset */}
        <ScrollViewStyleReset />

        {/* Custom fonts preload */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { margin: 0; padding: 0; height: 100%; }
          #root { display: flex; flex-direction: column; min-height: 100%; }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
