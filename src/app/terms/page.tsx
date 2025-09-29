import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Terms of Service - Invoicerly',
  description: 'Your agreement with us to use the service.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `These Terms form a binding agreement between you and the provider of Invoicerly (the “Service”). By creating an account or using the Service you accept these Terms and our Privacy Policy and Cookie Policy. If you use the Service on behalf of a company, you confirm you have authority to bind that company.

Key definitions used below:
• “Tokens” are pre-paid usage credits (not money, not e-money).
• “Customer Content” is data you input (clients, line items, PDFs, etc.).` },
  { id: 'eligibility', title: 'Eligibility & Account', body: `You must be at least 16 and able to enter into a contract.

Keep your account info accurate and your credentials secure. You are responsible for activity under your account.

We may ask for verification (e.g., company/VAT details) to enable certain features.

We may suspend or refuse accounts that violate these Terms, law, or reasonable security standards.` },
  { id: 'use', title: 'Acceptable Use', body: `You agree not to:

• Break the law, infringe IP, violate privacy, or submit illegal content.
• Abuse, probe, or disrupt our systems (e.g., scraping, rate-limit evasion, malware).
• Misrepresent invoices or tax treatment. You are responsible for the accuracy of invoices you issue.
• Use the Service to send spam or unlawful communications.

We may remove content or suspend access to protect users, comply with law, or operate the Service.` },
  { id: 'billing', title: 'Billing & Taxes', body: `Top-up model: You purchase Tokens (e.g., £/€1 = 100 tokens). Creating an invoice costs 10 tokens. Tokens do not expire but are non-transferable and usable only within the Service.

Payments: Card and other methods are processed by our payment providers; we do not store card numbers.

Pricing & changes: We may update prices or token costs prospectively; we’ll notify in-product or by email.

Taxes/VAT: Prices may be shown excluding VAT. We apply VAT based on your country and status (e.g., UK VAT, EU VAT, reverse-charge where applicable). You are responsible for any taxes arising from your business operations and for selecting the correct VAT treatment on invoices.

Refunds: See our Refund Policy. Where required by law, proportionate refunds may be offered for unused top-ups; otherwise top-ups are generally non-refundable.

Receipts: We provide receipts and a token ledger for your records.` },
  { id: 'cancellation', title: 'Cancellation & Termination', body: `You can stop using the Service and/or request account deletion at any time.

We may suspend or terminate your access for material breach, legal risk, or security reasons.

On termination: your license to use the Service ends; we will retain or delete data per our Privacy Policy and Retention rules. Unused tokens are handled per the Refund Policy and applicable law.

We may discontinue or materially change features with reasonable notice where feasible.` },
  { id: 'liability', title: 'Limitation of Liability', body: `The Service is provided “as is” within lawful limits. We do not guarantee uninterrupted or error-free operation.

To the maximum extent permitted by law, we are not liable for: lost profits, revenue, savings, data, or indirect/consequential damages.

Our total liability for all claims in any 12-month period is capped at the greater of £/€100 or the amount you paid to us for tokens in that period.

Nothing excludes liability for fraud, death or personal injury caused by negligence, or other liability that cannot be excluded by law.

You remain responsible for tax compliance and the accuracy of invoices you issue with the Service.` },
  { id: 'law', title: 'Governing Law', body: `UK view: These Terms and any dispute are governed by the laws of England & Wales, and the courts of England & Wales have exclusive jurisdiction.

EU view: These Terms and any dispute are governed by the laws of your EU Member State (default: Republic of Ireland if unspecified), with local courts having jurisdiction.

Mandatory consumer rights in your country remain unaffected.` },
  { id: 'contact', title: 'Contact', body: `GET STUFFED LTD (Company number 15673179)
Email: info@invoicerly.co.uk

Postal: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET

We respond within one business day.` },
  { id: 'optional', title: 'Optional clauses', body: `Changes to Terms. We may update these Terms from time to time. If changes are material, we’ll give reasonable notice. Continued use after the effective date means acceptance.

Intellectual Property. We (and our licensors) own all rights in the Service. You keep all rights in your Customer Content and grant us a limited license to host/process it to provide the Service.

Data Protection. We process personal data as set out in the Privacy Policy. We use appropriate safeguards for UK↔EU and international transfers.

Export Controls. You must comply with applicable export and sanctions laws.` },
];

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" sections={sections} />
  );
}
