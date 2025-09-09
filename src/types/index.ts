export interface Theme {
  name: string;
  bg: string;
  text: string;
  card: string;
  border: string;
  muted: string;
  primary: {
    text: string;
    bg: string;
    hover: string;
    ring: string;
  };
  accent: {
    text: string;
    bg: string;
  };
}

export interface PricingPlan {
  name: string;
  price: string;
  points: string[];
  cta: string;
  popular: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  tax: number;
}

export interface InvoiceData {
  currency: string;
  language: string;
  companyFrom: string;
  vatFrom: string;
  clientTo: string;
  vatTo: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  shipping: number;
  taxTotal: number;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  metric?: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  status: 'available' | 'preview' | 'pro';
  badge?: 'Available' | 'Coming soon' | 'Pro';
  cta?: 'use' | 'waitlist';
}



