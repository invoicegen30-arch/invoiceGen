import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Invoicerly - Create invoices in 30 seconds',
  description: 'VAT-aware templates, multi-currency, live preview, and one-click sending. Simple. Fast. Compliant.',
  keywords: 'invoice, invoicing, VAT, UK, EU, PDF, business, accounting',
  authors: [{ name: 'Invoicerly Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', sizes: 'any' }
    ],
    shortcut: '/favicon.svg?v=2',
    apple: '/favicon.svg?v=2',
  },
  openGraph: {
    title: 'Invoicerly - Create invoices in 30 seconds',
    description: 'VAT-aware templates, multi-currency, live preview, and one-click sending.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoicerly - Create invoices in 30 seconds',
    description: 'VAT-aware templates, multi-currency, live preview, and one-click sending.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
