'use client';

import { useState, useEffect } from 'react';
import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { formatCurrency, convertFromGBP, type Currency } from '@/lib/currency';

// Function to generate dynamic sections based on currency
function getTermsSections(currency: Currency): PolicySection[] {
  const currencySymbol = currency === 'GBP' ? '£' : '€';
  const tokenRate = currency === 'GBP' ? 100 : 100; // Both currencies: 100 tokens
  const currencyAmount = currency === 'GBP' ? 1 : 1.15; // GBP: £1, EUR: €1.15
  
  return [
    { 
      id: 'general', 
      title: '1. General Provisions', 
      body: `1.1. These Terms and Conditions ("Terms") govern access to and use of invoicerly.co.uk and related services operated by GET STUFFED LTD (trading as Invoicerly), Company No. 15673179, registered office: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET ("Company", "we", "us", "our").

1.2. By visiting the Site, creating an invoice draft, topping up tokens, or using any feature of the Services, you agree to be bound by these Terms. If you do not agree, do not use the Services.` 
    },
    { 
      id: 'definitions', 
      title: '2. Definitions', 
      body: `• "Services" — web tools that let you create, edit, export, and send invoices (PDF export and email dispatch), choose templates (Freelance, Construction, IT Services, Consulting), and manage related records.
• "Draft" — a preliminary invoice you compose in the interface.
• "Final File" — the generated invoice in PDF format downloaded by you or sent by email through the Service.
• "Client", "you" — any person or entity using the Services or purchasing tokens.
• "Tokens" — internal credits used to pay for features (packages available on the Site; indicative rate: ${currencySymbol}${currencyAmount} ≈ ${tokenRate} tokens; invoice generation costs 10 tokens). Tokens are top-up credits and do not expire.` 
    },
    { 
      id: 'eligibility', 
      title: '3. Eligibility, Account and Security', 
      body: `3.1. You must be 18+ or an authorised representative of a legal entity to register or purchase tokens.

3.2. You agree to provide accurate registration details and keep them updated.

3.3. You are responsible for safeguarding your credentials and for all activity under your account. Notify us immediately of any unauthorised use.` 
    },
    { 
      id: 'acceptable-use', 
      title: '4. Acceptable Use', 
      body: `4.1. You must use the Services lawfully and ethically. Prohibited uses include:
(a) creating fraudulent, misleading, or sham invoices;
(b) impersonation or unauthorised use of third-party data;
(c) sending invoices or emails that constitute spam, phishing, or harassment;
(d) attempting to bypass security, reverse engineer, or overload the platform;
(e) using the Services for illegal transactions or to disguise proceeds of crime.

4.2. We may suspend or terminate accounts involved in the above, investigate suspected abuse, and cooperate with law enforcement where required.` 
    },
    { 
      id: 'payments', 
      title: '5. Ordering, Tokens and Payments', 
      body: `5.1. Token top-ups are offered as one-time purchases (e.g., ${formatCurrency(10, currency)} / ${formatCurrency(50, currency)} / ${formatCurrency(100, currency)} packages and Custom) and may also be displayed in ${currency === 'GBP' ? 'EUR' : 'GBP'} equivalents on the Site.

5.2. Payments are processed by third-party providers listed on the Site. Access to paid features becomes available after successful settlement.

5.3. Prices are shown in ${currency} (and may display ${currency === 'GBP' ? 'EUR' : 'GBP'} equivalents). Taxes and fees may apply per law and payment-provider terms.

5.4. Token valuation and consumption. Unless stated otherwise on the Site, ${currencySymbol}${currencyAmount} ≈ ${tokenRate} tokens and generating one Final File costs 10 tokens. Email dispatch may consume additional tokens if indicated in the UI.

5.5. No expiry. Tokens do not expire. Tokens are not legal tender, non-transferable, and hold no cash value outside the Service.

5.6. In case of suspected fraud, chargeback, or payment reversal, we may freeze or deduct tokens, suspend the account, and request verification.` 
    },
    { 
      id: 'service-delivery', 
      title: '6. Service Delivery (Drafts, PDFs, Email)', 
      body: `6.1. Drafts and Final Files are generated automatically once the required tokens are deducted.

6.2. You must review the Final File immediately upon generation and before sending to third parties.

6.3. Email dispatch is performed on your instruction. We do not guarantee third-party deliverability (spam filters, mailbox limits, incorrect addresses). If sending fails, we may allow re-send attempts or offer regeneration of the file; refunds of tokens are addressed in Section 7.

6.4. The Services are tools; you remain solely responsible for invoice accuracy, lawful use, and regulatory/tax compliance (e.g., VAT, numbering, disclosures).` 
    },
    { 
      id: 'refunds', 
      title: '7. Cancellations and Refunds', 
      body: `7.1. Unused tokens. For consumers (not business users) purchasing remotely, you may cancel a token purchase within 14 days of the transaction provided none of the tokens have been used; refunds are issued minus payment-provider fees where applicable.

7.2. Spent tokens are non-refundable. Tokens consumed for generation or sending features cannot be returned.

7.3. Service faults. If a significant technical fault attributable to us prevents generation or results in materially corrupted output, we may at our discretion regenerate the file or credit/refund the tokens used.

7.4. Refunds are made to the original payment method where possible. We may request reasonable information to verify the requester.` 
    },
    { 
      id: 'intellectual-property', 
      title: '8. Intellectual Property', 
      body: `8.1. Your content. You retain all rights to data you input (business details, line items, logos you own). You grant us a limited licence to process that content solely to provide the Services and to maintain audit and delivery logs.

8.2. Our materials. The Site, code, designs, templates, and documentation are our or our licensors' intellectual property. We grant you a personal, non-exclusive, non-transferable licence to use the invoice templates to generate your own invoices via the Service.

8.3. You must not copy, resell, or redistribute the templates or Service elements outside the platform.` 
    },
    { 
      id: 'privacy', 
      title: '9. Privacy, Confidentiality and Data Handling', 
      body: `9.1. We process personal data under the UK GDPR and Data Protection Act 2018. See our Privacy Policy for details.

9.2. Content you save remains in your account until you delete it or your account is closed. We may retain limited system and delivery logs (e.g., timestamps, recipient addresses, status codes) for security, billing, and legal compliance.

9.3. We apply reasonable technical and organisational measures. For an overview, see our Security page; for uptime and maintenance updates, see Status (where available).` 
    },
    { 
      id: 'warranties', 
      title: '10. Warranties and Important Disclaimers', 
      body: `10.1. We will provide the Services with reasonable care and skill and substantially as described.

10.2. The Services are provided "as is" and "as available." We do not warrant uninterrupted or error-free operation or specific email deliverability.

10.3. We do not provide accounting, tax, or legal advice. We do not guarantee that any invoice will meet jurisdiction-specific formalities. You are responsible for compliance and outcomes.` 
    },
    { 
      id: 'liability', 
      title: '11. Limitation of Liability', 
      body: `11.1. We are not liable for indirect or consequential loss (including lost profit, revenue, business, goodwill, or data), except where liability cannot be excluded by law.

11.2. Our aggregate liability for all claims arising out of or in connection with the Services shall not exceed the amount you paid for the token package used for the specific action giving rise to the claim (or, if none, the total fees paid by you to us in the 12 months preceding the event).` 
    },
    { 
      id: 'indemnity', 
      title: '12. Indemnity', 
      body: `You agree to indemnify and hold us harmless from claims, damages, and costs (including reasonable legal fees) arising from:
(a) your breach of these Terms;
(b) your unauthorised or unlawful use of third-party data;
(c) invoices you generate or emails you send via the Service.` 
    },
    { 
      id: 'third-party', 
      title: '13. Third-Party Services and Links', 
      body: `The Site may reference or integrate third-party services (e.g., payment processors, email providers). We are not responsible for third-party content, availability, or terms. Your use of them is governed by their respective policies.` 
    },
    { 
      id: 'termination', 
      title: '14. Suspension and Termination', 
      body: `14.1. We may suspend or terminate access if you breach these Terms, engage in fraud, or pose a security or legal risk.

14.2. Termination does not affect accrued rights or obligations. We may keep minimal records as required by law.` 
    },
    { 
      id: 'changes', 
      title: '15. Changes to These Terms', 
      body: `We may update these Terms. Material changes will be posted on the Site or sent by email. Continued use after the effective date constitutes acceptance.` 
    },
    { 
      id: 'notices', 
      title: '16. Notices', 
      body: `Official communications to the Company should be sent to:
Email: info@invoicerly.co.uk
Address: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET
Phone: +44 7537 103023` 
    },
    { 
      id: 'governing-law', 
      title: '17. Governing Law and Jurisdiction', 
      body: `These Terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales, except where mandatory consumer law provides otherwise.` 
    },
    { 
      id: 'miscellaneous', 
      title: '18. Miscellaneous', 
      body: `18.1. If any provision is found invalid or unenforceable, the remainder remains in force.

18.2. Failure to enforce a right is not a waiver.

18.3. These Terms constitute the entire agreement between you and us regarding the Services and supersede prior understandings.` 
    },
    { 
      id: 'company-details', 
      title: 'Company Details', 
      body: `GET STUFFED LTD (trading as Invoicerly)
Company number: 15673179
Registered office: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET
Email: info@invoicerly.co.uk | Tel: +44 7537 103023` 
    },
  ];
}

function TermsPageClient() {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === 'undefined') return 'GBP';
    try {
      return (localStorage.getItem('currency') as Currency) || 'GBP';
    } catch {
      return 'GBP';
    }
  });

  // Listen for currency changes from header using BroadcastChannel
  useEffect(() => {
    const bc = new BroadcastChannel('app-events');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'currency-updated' && (event.data.currency === 'GBP' || event.data.currency === 'EUR')) {
        setCurrency(event.data.currency);
      }
    };

    bc.addEventListener('message', handleMessage);
    
    return () => {
      bc.removeEventListener('message', handleMessage);
      bc.close();
    };
  }, []);

  const sections = getTermsSections(currency);

  return (
    <PolicyPage title="Terms & Conditions" sections={sections} />
  );
}

export default function TermsPage() {
  return <TermsPageClient />;
}
