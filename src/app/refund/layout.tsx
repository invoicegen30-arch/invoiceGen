import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy - Invoicerly',
  description: 'Comprehensive refund and cancellation policy for Invoicerly services. Learn about token refunds, processing times, and consumer rights.',
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
