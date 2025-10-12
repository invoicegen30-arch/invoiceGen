import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Invoicerly',
  description: 'Terms and Conditions for using Invoicerly invoice generation services. Learn about our policies, token system, and user responsibilities.',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
