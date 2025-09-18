import { PricingPlan, Testimonial, Feature, TemplateInfo } from '@/types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Beginner',
    price: 'GBP 10',
    points: ['Top up 1,000 tokens (~100 invoices)', 'No subscription', 'Draft/preview free'],
    cta: 'Buy tokens',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'GBP 50',
    points: ['Top up 5,000 tokens (~500 invoices)', 'Templates & logo', 'Payment links', 'Read receipts'],
    cta: 'Buy tokens',
    popular: true,
  },
  {
    name: 'Business',
    price: 'GBP 100',
    points: ['Top up 10,000 tokens (~1,000 invoices)', 'Teams & roles', 'Integrations (Stripe/Wise)', 'API & webhooks'],
    cta: 'Buy tokens',
    popular: false,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marta K.',
    role: 'Freelance Designer',
    text: 'Finally painless invoices. Two clicks and the client gets a VAT-correct bill.',
  },
  {
    name: 'Anders L.',
    role: 'Construction PM',
    text: "Love the live preview - it's easy to explain what's included and why.",
  },
  {
    name: 'Nicolas D.',
    role: 'IT Services',
    text: 'Saved clients & items as presets sped everything up for us.',
  },
];

export const FEATURES: Feature[] = [
  {
    id: 'singleColumn',
    title: 'Single-column form',
    description: 'Lower cognitive load, logically grouped fields.',
    metric: '-32% time to first invoice',
  },
  {
    id: 'livePreview',
    title: 'Live PDF preview',
    description: 'What you see is exactly what your client gets.',
    metric: '-18% corrections',
  },
  {
    id: 'multiCurrency',
    title: 'Multi-currency / VAT',
    description: 'Correct totals, tax breakdowns, number formats.',
    metric: '0 errors in totals (test suite)',
  },
  {
    id: 'autoSave',
    title: 'Auto-save & numbering',
    description: 'Drafts and INV-{YYYY}-{#####} sequencing.',
    metric: 'No lost drafts',
  },
];

export const TEMPLATE_CATEGORIES = [
  'Freelance',
  'Construction',
  'IT Services',
  'Consulting',
  'Retail',
  'Healthcare',
  'Education',
  'Non-profit',
];

export const TEMPLATES: TemplateInfo[] = [
  { id: 'freelance', name: 'Freelance', status: 'available', badge: 'Available', cta: 'use' },
  { id: 'construction', name: 'Construction', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'it', name: 'IT Services', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
  { id: 'consulting', name: 'Consulting', status: 'preview', badge: 'Coming soon', cta: 'waitlist' },
];



