import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Invoicerly - VAT-aware invoicing for UK & EU',
  description: 'Learn about Invoicerly\'s token-based invoice generation service. Simple, fast, compliant invoicing with pay-as-you-go pricing and privacy-by-design.',
  keywords: 'about invoicerly, invoice generation, UK VAT, EU VAT, token pricing, privacy, security',
  openGraph: {
    title: 'About Invoicerly - VAT-aware invoicing for UK & EU',
    description: 'Learn about Invoicerly\'s token-based invoice generation service. Simple, fast, compliant invoicing with pay-as-you-go pricing.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Invoicerly",
            "legalName": "PREPARING BUSINESS LTD",
            "url": "https://invoicerly.co.uk",
            "logo": "https://invoicerly.co.uk/logo.png",
            "description": "VAT-aware invoice generation service for UK and EU businesses with token-based pricing",
            "foundingDate": "2024",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Dept 6189, 43 Owston Road",
              "addressLocality": "Carcroft, Doncaster",
              "postalCode": "DN6 8DA",
              "addressCountry": "GB"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "info@invoicerly.co.uk",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://invoicerly.co.uk"
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Invoicerly",
            "url": "https://invoicerly.co.uk",
            "description": "Create professional invoices in 30 seconds. VAT-aware templates, multi-currency, live preview, and one-click sending.",
            "publisher": {
              "@type": "Organization",
              "name": "Invoicerly"
            }
          })
        }}
      />
      <AboutPageClient />
    </>
  );
}
