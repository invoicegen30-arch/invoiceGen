import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Cookie Policy - Invoicerly',
  description: 'What cookies are and why we use them.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `This Cookie Policy explains how Invoicerly (“we”, “us”) uses cookies and similar technologies (such as localStorage, pixels, SDKs, and device identifiers) on our website and web app (the “Service”).
We use cookies to run core features, remember your choices, measure performance, and—only with your consent—support marketing.

We do not sell personal data. For how we handle personal data more broadly, see our Privacy Policy.` },

  { id: 'types', title: 'Types of Cookies', body: `We group cookies and similar technologies into the categories below. Exact names may change as we improve the Service.` },

  { id: 'necessary', title: '1) Strictly necessary (always on)', body: `Used to deliver the Service and keep it secure. Without these, the app won’t work.

• Session & authentication (e.g., keep you signed in, CSRF protection)
• Load balancing and error tracking
• Token purchases / checkout state` },

  { id: 'preferences', title: '2) Preferences', body: `Remember your choices to provide a consistent experience.

• Language/region (EN, UK/EU)
• UI settings (currency display GBP/EUR, theme, form layout)
• Cookie consent state` },

  { id: 'analytics', title: '3) Performance & analytics (consent-based in UK/EU)', body: `Help us understand usage and improve reliability and speed. Data is aggregated; IPs are truncated or anonymised where available.

• Page and feature usage, latency, crash reports
• A/B testing to improve UX` },

  { id: 'functionality', title: '4) Functionality', body: `Optional features you ask us to enable.

• Support widget / contact form context
• Saved templates, clients, and invoice presets (may use localStorage)` },

  { id: 'marketing', title: '5) Marketing (opt-in only)', body: `Used to measure campaigns and show more relevant messages off-site. We use these only after you give consent and you can withdraw it anytime.

Similar technologies: We also use localStorage/IndexedDB to cache preferences and drafts. They are treated like cookies for consent purposes.` },

  { id: 'manage', title: 'Managing Preferences', body: `You’re in control.

In-app: Open “Cookie preferences” in the footer or settings. Turn categories on/off (except strictly necessary). Changes apply immediately and can be withdrawn at any time.

Browser controls: You can block or delete cookies via your browser settings. Blocking strictly necessary cookies may break sign-in or checkout.

Mobile/OS settings: Some identifiers can be reset or limited in device settings.

Signals: Where supported, we honour Global Privacy Control (GPC) / “Do Not Track” equivalents for analytics/marketing categories.

Third-party tools: If we use external analytics/ads platforms, you can also use their opt-out mechanisms. Your in-app choice takes precedence.` },

  { id: 'duration', title: 'Duration', body: `Cookies have different lifetimes:

Session cookies – deleted when you close the browser.

Persistent cookies – remain until they expire or you delete them. Typical durations:

• Strictly necessary: up to 12 months (e.g., consent logs, security)
• Preferences: up to 12 months
• Analytics: up to 13 months (per regional guidance)
• Marketing: 6–13 months depending on provider and your consent

We review lifetimes periodically and minimise where feasible.` },

  { id: 'contact', title: 'Contact', body: `Questions or requests about this policy?

Email: info@invoicerly.co.uk
Postal: Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET

We reply within one business day.` },
];

export default function CookiesPage() {
  return (
    <PolicyPage title="Cookie Policy" sections={sections} />
  );
}
