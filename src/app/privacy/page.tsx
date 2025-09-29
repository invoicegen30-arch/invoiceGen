import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Privacy Policy - Invoicerly',
  description: 'How we collect, use, and protect personal data.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `This policy explains how we collect, use, and protect personal data when you use Invoicerly (the “Service”). We built the product for UK & EU invoicing and keep data handling simple and transparent.

We do not sell personal data. We only process it to provide and improve the Service.` },
  { id: 'scope', title: 'Scope & Region', body: `This policy applies to users in the UK and EU/EEA.
Where we transfer data between the UK and EEA or to other countries, we use appropriate safeguards (e.g., Standard Contractual Clauses and the UK Addendum).

The Service is not intended for children under 16.` },
  { id: 'data', title: 'Data We Collect', body: `Account data: name, email, password hash, country, preferences.

Company (seller) data: company name, VAT/registration numbers, address, IBAN/BIC, invoice numbering settings.

Customer (buyer) data you enter: client names, VAT/registration numbers, addresses, line items, notes, and PDFs you generate (“Customer Content”).

Billing & tokens: top-up amounts, currency (GBP/EUR), token balance and ledger (no card numbers on our servers).

Usage & device data: pages/actions, app settings, approximate location (from IP), device/browser info, crash/error logs.

Support data: messages you send to info@invoicerly.co.uk, attachments you choose to share.

Cookies & similar tech: see Cookies below and our Cookie Policy.

You can choose not to provide some data, but the Service may not work as expected.` },
  { id: 'use', title: 'How We Use Data', body: `We process data to:

• Provide the Service: create invoices/PDFs, store drafts, manage token balance, email/share invoices on your request.
• Operate & secure: authentication, fraud/abuse prevention, rate limiting, backups, incident response.
• Billing & compliance: process payments, keep accounting/tax records.
• Improve the product: analytics, troubleshooting, feature development.
• Communicate: service messages (e.g., receipts, invoice delivery status), product updates.
• Legal reasons: handle claims, requests from authorities when lawfully required.

We don’t use Customer Content for advertising or model training.` },
  { id: 'legal', title: 'Legal Bases (EU/UK)', body: `We rely on:

• Contract – to provide the Service you requested.
• Legitimate interests – to run, secure, and improve the Service (balanced against your rights).
• Consent – for non-essential cookies/analytics and optional marketing (you can withdraw anytime).
• Legal obligation – tax, accounting, and compliance record-keeping.
• Vital interests – only in rare, safety-related situations.

We do not perform automated decision-making that produces legal or similarly significant effects.` },
  { id: 'rights', title: 'Your Rights', body: `Subject to regional laws, you can:

• Access your data and get a copy.
• Rectify inaccurate data.
• Erase data (“right to be forgotten”) where applicable.
• Object to or restrict certain processing.
• Port data you provided to us.
• Withdraw consent (for things based on consent).
• Complain to a supervisory authority: in the UK, the ICO; in the EEA, your local DPA.

To exercise rights, email info@invoicerly.co.uk from your account email. We’ll respond within one month.` },
  { id: 'security', title: 'Security', body: `We use technical and organizational measures including:

• Encryption in transit (TLS) and at rest for core data.
• Strict access controls, least-privilege, and audit logs.
• Regular backups and disaster-recovery procedures.
• Vulnerability management and incident response.

No method is 100% secure, but we work to keep risk low and respond quickly to issues.` },
  { id: 'retention', title: 'Retention', body: `We keep data only as long as needed for the purposes above:

• Account & company settings: for your account lifetime; delete when you close your account.
• Customer Content (invoices, clients, PDFs): until you delete it or your account is closed; some metadata may remain in backups for a limited time.
• Billing & token ledger: retained to meet tax/accounting laws (typically 6 years in the UK; EU periods may vary).
• Support emails/logs: for troubleshooting and audit, then deleted or anonymized.

When retention ends, we delete or anonymize data.` },
  { id: 'sharing', title: 'Sharing & Processors', body: `We share data only with:

• Service providers (processors): cloud hosting & storage, email delivery, analytics, logging/monitoring, customer support, and PDF generation.
• Payment processors: e.g., Stripe for card payments and potentially Wise for settlements—card details are processed by the provider and never stored on our servers.
• Professional advisors (legal/accounting) and authorities when required by law.
• Business transfers: if we undergo a merger, acquisition, or asset sale, we’ll notify you and continue to protect your data.

We require processors to protect data, act only on our instructions, and sign appropriate data protection terms.` },
  { id: 'cookies', title: 'Cookies', body: `We use:

• Strictly necessary cookies – sign-in, security, load balancing.
• Preferences – your language/region, UI settings.
• Analytics – understand usage and improve (consent-based in the EU/UK).
• Marketing – only if you opt in.

You can manage preferences in the app and via browser settings. For details, see our Cookie Policy.` },
  { id: 'contact', title: 'Contact', body: `Data controller: GET STUFFED LTD
Company number: 15673179
Email: info@invoicerly.co.uk

Postal: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET

If you have questions or want to exercise your rights, email us. We reply within one business day.` },
];

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" sections={sections} />
  );
}
