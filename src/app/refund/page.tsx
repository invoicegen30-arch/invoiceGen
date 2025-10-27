'use client';

import { useState, useEffect } from 'react';
import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';
import { formatCurrency, convertFromGBP, type Currency } from '@/lib/currency';

// Function to generate dynamic sections based on currency
function getRefundSections(currency: Currency): PolicySection[] {
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  const tokenRate = currency === 'GBP' ? 100 : 100; // All currencies: 100 tokens
  const currencyAmount = currency === 'GBP' ? 1 : currency === 'EUR' ? 1.15 : 1.33; // GBP: £1, EUR: €1.15, USD: $1.33
  const exampleAmount = convertFromGBP(20, currency); // £20 = €23
  const exampleTokens = 2000; // Always 2000 tokens for £20/€23
  
  return [
    { 
      id: 'summary', 
      title: '1. Customer Summary', 
      body: `• Refunds are handled under this Policy and applicable consumer law.
• Standard processing time is 5–10 business days after approval; posting times depend on banks/payment providers.
• Refunds will not exceed the amount you originally paid (less any non-refundable payment provider fees).
• Used tokens (e.g., invoice generation, PDF export, email sending, or other metered features) are non-refundable, except where a material technical fault attributable to us cannot be remedied.
• Token packages/top-ups may be refunded only if completely unused. Once tokens are deducted, refunds are generally unavailable.
• Promotional credits, discounts, or bonus tokens are normally non-refundable, unless required by law or expressly stated otherwise.
• Submit refund requests to info@invoicerly.co.uk with full order details.
• We may update this Policy; material changes will be communicated as described in Section 8.
• Digital content & immediate use: if you request immediate access to the Services and explicitly agree to start performance (e.g., by generating/downloading a PDF invoice), you may lose your statutory cancellation right (see Section 4.6).` 
    },
    { 
      id: 'scope', 
      title: '2. Scope and Legal Note', 
      body: `This Policy applies to refunds and cancellations relating to invoice creation, PDF export, email dispatch, template use, and other related services offered via invoicerly.co.uk by GET STUFFED LTD (trading as Invoicerly). Nothing here affects your statutory rights (including under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 and the Consumer Rights Act 2015, where applicable).` 
    },
    { 
      id: 'definitions', 
      title: '3. Definitions', 
      body: `• Order / Service Fee — the amount you paid for token packages/top-ups.
• Token Package / Top-Up — prepaid credits used to access Services (${currencySymbol}${currencyAmount} ≈ ${tokenRate} tokens; generating one invoice costs 10 tokens, unless otherwise stated in the interface).
• Used Tokens — tokens deducted for generating a PDF invoice, sending an email, or using other metered features.
• Unused Tokens — tokens that remain in your account balance.
• Promotional Credits — bonus tokens or discounts granted under promotions.
• Tokens are not legal tender, non-transferable, hold no cash value outside the Service, and do not expire.` 
    },
    { 
      id: 'core-rules', 
      title: '4. Core Refund Rules', 
      body: `4.1 Refund cap. Refunds will not exceed the amount actually paid (less non-refundable payment provider fees). Refunds are issued in the original payment currency where possible.
4.2 Used tokens. Tokens already used are not eligible for refund, except where the Service was materially defective and could not be reasonably remedied.
4.3 Cancellation before use. If you cancel before spending any tokens, your unused token balance may be refunded, minus reasonable costs incurred (including non-refundable processing fees).
4.4 Defective or non-conforming output. If a generated PDF invoice is materially defective due to a fault on our side, we will first attempt regeneration or re-send. If the issue cannot be resolved within a reasonable timeframe, a partial or full refund/credit may be issued.
4.5 Promotions. Promotional credits/bonus tokens/discounts are normally non-refundable unless required by law.
4.6 Immediate use & loss of cancellation right. If you request that we begin supplying digital content immediately and explicitly acknowledge the loss of the statutory right to cancel, that right may no longer apply once generation/download starts.
4.7 Custom/managed services (if offered). Where manual implementation, API setup, or personal manager support is provided, once work has started, refunds are not available unless otherwise agreed in writing.` 
    },
    { 
      id: 'request-process', 
      title: '5. How to Request a Refund', 
      body: `Email info@invoicerly.co.uk with:
• Your order reference number;
• The account email used for purchase;
• Whether the request concerns unused tokens, cancellation, or defective output;
• For defects: a description plus evidence (screenshots, filenames, timestamps, error messages);
• Your preferred refund method (normally the original payment method).

Process:
• We acknowledge within 5 business days;
• We investigate and may request more details;
• We provide a decision and, if approved, issue the refund within 5–10 business days of approval (bank posting times vary).` 
    },
    { 
      id: 'investigation', 
      title: '6. Investigation, Evidence and Decisions', 
      body: `6.1 We review order history, payment logs, token usage, generation and email-delivery records.
6.2 Approved refunds normally go to the original payment method; if not possible, a reasonable alternative (e.g., bank transfer) may be offered.
6.3 If refused, we will explain the reasons and outline next steps (e.g., further checks or evidence).` 
    },
    { 
      id: 'chargebacks', 
      title: '7. Chargebacks, Fraud and Abuse', 
      body: `If you initiate a chargeback while a refund request is pending, the case becomes a dispute. We will provide evidence (order records, confirmations, timestamps, downloads/sends). Refunds may be refused and accounts suspended in cases of fraud, abuse, or repeated unwarranted chargebacks.` 
    },
    { 
      id: 'changes', 
      title: '8. Changes to this Policy', 
      body: `We may update this Policy periodically. Material changes will be announced on our website or by email. Updates apply to future transactions and do not retroactively affect completed purchases.` 
    },
    { 
      id: 'records', 
      title: '9. Record Retention', 
      body: `We retain necessary records (orders, payments, token usage, generation/delivery logs) for at least 24 months, and up to 6 years for disputes or corporate/legal requirements, in line with our Privacy Policy and applicable law.` 
    },
    { 
      id: 'escalation', 
      title: '10. Escalation and Disputes', 
      body: `If you disagree with our decision, you may appeal by emailing full details to info@invoicerly.co.uk. Appeals are normally reviewed within 10 business days. This does not affect your statutory right to seek dispute resolution or legal remedies.` 
    },
    { 
      id: 'examples', 
      title: '11. Examples', 
      body: `• Unused tokens: You purchased ${formatCurrency(exampleAmount, currency)} = ${exampleTokens} tokens and used 300 tokens (e.g., three invoice generations). ${exampleTokens - 300} tokens remain → a refund may be issued for ${exampleTokens - 300} tokens (minus fees).
• Used tokens: If tokens were spent to generate/download a PDF invoice or send an invoice email, a refund is only possible where output/delivery was materially defective and could not be remedied.
• Promotional tokens: 100 bonus tokens received in a promotion → non-refundable.` 
    },
    { 
      id: 'contact', 
      title: '12. Contact Details', 
      body: `Email: info@invoicerly.co.uk
Phone: +44 7537 103023
Company: GET STUFFED LTD (trading as Invoicerly)
Registered office: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET
Company No.: 15673179` 
    },
  ];
}

function RefundPageClient() {
  const [currency, setCurrency] = useState<Currency>('GBP'); // Always start with GBP for SSR
  const [mounted, setMounted] = useState(false);

  // Initialize currency from localStorage after mounting (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('currency') as Currency;
      if (saved && (saved === 'GBP' || saved === 'EUR' || saved === 'USD')) {
        setCurrency(saved);
      }
    } catch {}
  }, []);

  // Listen for currency changes from header using BroadcastChannel
  useEffect(() => {
    const bc = new BroadcastChannel('app-events');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'currency-updated' && (event.data.currency === 'GBP' || event.data.currency === 'EUR' || event.data.currency === 'USD')) {
        setCurrency(event.data.currency);
      }
    };

    bc.addEventListener('message', handleMessage);
    
    return () => {
      bc.removeEventListener('message', handleMessage);
      bc.close();
    };
  }, []);

  const sections = getRefundSections(currency);

  return (
    <PolicyPage title="Refund & Cancellation Policy" sections={sections} />
  );
}

export default function RefundPage() {
  return <RefundPageClient />;
}
