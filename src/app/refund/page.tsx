import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Refund & Cancellation Policy - Invoicerly',
  description: 'How refunds and cancellations work.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `This policy explains how refunds and cancellations work for Invoicerly (the “Service”).
We sell usage credits (“Tokens”) via one-off top-ups. Tokens are not money or e-money; they are credits you can spend in the Service (e.g., 10 tokens = create one invoice).

We aim to resolve billing issues quickly and fairly.

For personal data handling, see our Privacy Policy.` },

  { id: 'trials', title: 'Trials & Renewals', body: `We don’t offer subscriptions or auto-renewals.
All purchases are one-off top-ups. You can top up whenever you need; there is no monthly commitment.` },

  { id: 'refunds', title: 'Refunds — General rules', body: `• Unused tokens: If you bought tokens and haven’t spent any, you can request a refund within 14 days of purchase. We’ll cancel the tokens and refund the original payment method.
• Partially used tokens: If some tokens were spent, refunds are generally not available for the used portion. We may, at our discretion or where required by law, refund the unused remainder after deducting any promotional or fraud-prevention adjustments.
• Spent tokens: Tokens spent to generate invoices or use paid actions are non-refundable.` },

  { id: 'request', title: 'How to request', body: `Email info@invoicerly.co.uk from your account email with:

• Top-up date and amount
• Currency (GBP/EUR)
• Reason
• Any relevant screenshots

We usually reply within 1 business day.` },

  { id: 'processing', title: 'Processing times', body: `Approved refunds are issued to the original payment method.

• Card refunds typically appear within 5–10 business days (bank-dependent).
• Once refunded, the same amount of tokens is removed from your balance (if not already removed).` },

  { id: 'fraud', title: 'Fraud, chargebacks & abuse', body: `To protect users and the Service, we may investigate unusual activity. We may decline or limit refunds where we suspect abuse (e.g., repeated refund cycles, disputed charges after token use). Unauthorized transactions should also be reported to your bank; we’ll cooperate with the investigation.` },

  { id: 'vat', title: 'VAT', body: `Refunds include VAT when applicable. If a refund is partial, VAT is adjusted proportionally.` },

  { id: 'eu_rights', title: 'EU/UK Consumer Rights', body: `Our tokens are digital content supplied without a physical medium.

Right of withdrawal (14 days): Under UK/EU consumer law, you usually have 14 days to cancel digital content unless you consent to immediate supply and acknowledge you’ll lose the right to cancel once supply begins.

At checkout, we ask for consent to credit tokens immediately. When you consent and tokens are credited, the legal right to withdraw is waived for the credited amount.

If you did not consent to immediate supply and did not use any tokens, you may withdraw within 14 days and receive a refund.

Your statutory rights remain unaffected.` },

  { id: 'contact', title: 'Contact', body: `Questions or refund requests:

Email: info@invoicerly.co.uk
Postal: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET

We reply within one business day.` },
];

export default function RefundPage() {
  return (
    <PolicyPage title="Refund & Cancellation Policy" sections={sections} />
  );
}
