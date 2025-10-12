import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Privacy Policy - Invoicerly',
  description: 'Comprehensive privacy policy for Invoicerly services. Learn how we collect, process, and protect your personal data in compliance with UK GDPR.',
};

const sections: PolicySection[] = [
  { 
    id: 'introduction', 
    title: '1. Introduction', 
    body: `We value your privacy and are committed to handling personal data responsibly. This Privacy Policy explains what data we collect, why we process it, how long we retain it, who we share it with, and how you can exercise your rights in connection with the services provided at invoicerly.co.uk operated by GET STUFFED LTD (trading as Invoicerly), Company No. 15673179, registered office: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET ("Invoicerly", "we", "us", "our").

For questions or data requests, contact: info@invoicerly.co.uk or +44 7537 103023.

Who is the controller?
• We act as controller for account, billing, support and website usage data.
• We act as processor for Customer Content you input into the Service (e.g., invoice line items, your clients' names, addresses and email recipients) and process it on your instructions. A Data Processing Addendum (DPA) is available on request.` 
  },
  { 
    id: 'data-collection', 
    title: '2. What Personal Data We Collect', 
    body: `We only collect data necessary to operate and improve the Service. Typical categories include:

Account & Identity — name, email address, password hash, role/team, company profile, billing/postal address.

Transactions — token top-ups, order references, invoice/receipt records, payment identifiers (we do not store full card details; payments are handled by our providers).

Service Usage & Technical — IP address, device/browser type, access and event logs, timestamps, cookie IDs, error telemetry.

Customer Content — invoice data you provide (your business details, recipients' names/emails/addresses, line items, taxes, numbers), file metadata and generated PDF.

Email Delivery Metadata — recipient addresses you choose to send to, message IDs, delivery status (sent/bounced/open where available), timestamps.

Support & Correspondence — messages, attachments, and case history.

Marketing Preferences — opt-in/opt-out status, communication history.

We do not collect more information than required for the purposes below.` 
  },
  { 
    id: 'legal-bases', 
    title: '3. Why We Process Your Data and Legal Bases', 
    body: `• Provide the Service (contract performance): create drafts, generate and store PDFs, send invoices by email, manage tokens and accounts, and communicate about service delivery.

• Payments & fraud prevention (legal obligation / legitimate interests): verify purchases, detect misuse, maintain accounting and tax records.

• Support, refunds, disputes (contract / legitimate interests).

• Improvements & security (legitimate interests): monitoring, debugging, analytics in aggregate or anonymised form, load balancing, access controls.

• Marketing (consent): we send marketing messages only if you have opted in; you may withdraw consent at any time.

• Legal compliance (legal obligation): record-keeping, responding to lawful requests from authorities.

Where we rely on legitimate interests, we balance them against your rights and expectations.` 
  },
  { 
    id: 'sharing-transfers', 
    title: '4. Sharing and International Transfers', 
    body: `We share personal data with trusted service providers where necessary to operate the Service, for example:

• Payment processors and banks (billing, fraud checks).

• Hosting and cloud platforms (application hosting, file storage/backups).

• Email delivery and communications tools (sending invoices/notifications, logging delivery).

• Analytics, monitoring and error-tracking tools.

• Professional advisers (legal/accounting), as needed.

• Regulators, courts or law enforcement where required by law.

Some providers may be located outside the UK/EEA. We rely on UK adequacy regulations, the UK International Data Transfer Addendum (IDTA) and/or Standard Contractual Clauses (SCCs), plus supplementary measures as appropriate. We do not transfer data in a way that reduces protections under applicable law.` 
  },
  { 
    id: 'cookies', 
    title: '5. Cookies and Similar Technologies', 
    body: `We use cookies and similar technologies for essential operations, security, analytics and (with your consent) marketing. Essential cookies are required for the platform to function. See our Cookies Policy for details and controls.` 
  },
  { 
    id: 'retention', 
    title: '6. Data Retention', 
    body: `We retain data only as long as necessary for the stated purposes and legal obligations:

• Orders, invoices and payment logs: minimum 24 months, up to 6 years for tax, accounting or disputes.

• Account & support records: while your account is active and for a reasonable period thereafter for security, fraud prevention and record-keeping.

• Customer Content (invoice drafts/PDFs): stored while you keep them in your workspace; temporary files created during generation may be deleted automatically after processing.

• Email delivery metadata: retained for a limited period to evidence delivery and troubleshoot deliverability.

• Marketing data: until you withdraw consent or we no longer have a lawful basis.

When data is no longer required, we securely delete or anonymise it.` 
  },
  { 
    id: 'responsibilities', 
    title: '7. Your Responsibilities (Recipients\' Data)', 
    body: `You are responsible for ensuring you have a lawful basis (e.g., contract or legitimate interests) to use and send personal data of your invoice recipients through the Service and for providing any required privacy information to those recipients.` 
  },
  { 
    id: 'rights', 
    title: '8. Your Rights', 
    body: `Under UK data-protection law, you may:

• Access your personal data;

• Rectify inaccurate data;

• Erase data in certain cases;

• Restrict processing;

• Object to processing based on legitimate interests or to direct marketing;

• Port data you provided in a structured, commonly used format;

• Withdraw consent where processing relies on consent.

To exercise your rights, email info@invoicerly.co.uk. We may need to verify your identity. We respond within statutory time limits (normally one month) unless an extension or lawful refusal applies.` 
  },
  { 
    id: 'security', 
    title: '9. Security Measures', 
    body: `We implement appropriate technical and organisational measures, including encryption in transit, hardened infrastructure, access controls, least-privilege permissions, secure backups, audit logging and staff awareness. No system is completely secure; if a breach occurs likely to affect your rights, we will notify you and the relevant regulator in accordance with law.` 
  },
  { 
    id: 'children', 
    title: '10. Children', 
    body: `The Service is intended for users 18+. We do not knowingly collect personal data from children.` 
  },
  { 
    id: 'automation', 
    title: '11. Automated Decision-Making and Profiling', 
    body: `We do not conduct automated decision-making that produces legal or similarly significant effects. Limited automation (e.g., analytics, spam/abuse detection) may be used to protect and improve the Service and does not override your rights.` 
  },
  { 
    id: 'changes', 
    title: '12. Changes to this Policy', 
    body: `We may revise this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on our website. The updated Policy will display a new effective date.` 
  },
  { 
    id: 'contact', 
    title: '13. Contact & Complaints', 
    body: `Controller: GET STUFFED LTD (trading as Invoicerly)
Email: info@invoicerly.co.uk | Tel: +44 7537 103023
Address: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET` 
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

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" sections={sections} />
  );
}
