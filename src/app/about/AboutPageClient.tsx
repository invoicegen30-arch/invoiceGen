'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DemoPreview from '@/components/demo/DemoPreview';
import { THEME } from '@/lib/theme';

export default function AboutPageClient() {
  const handleSecurityClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'about_security_click', {
        event_category: 'engagement',
        event_label: 'security_link'
      });
    }
  };

  const handlePressDownload = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'about_press_download', {
        event_category: 'engagement',
        event_label: 'press_kit_download'
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="pt-10 pb-16">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white/70 backdrop-blur border-black/10 shadow-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>UK & EU VAT-ready</span>
            <span>·</span>
            <span>Pay-as-you-go</span>
            <span>·</span>
            <span>Privacy-first</span>
          </motion.div>

          <motion.h1
            className={`text-4xl sm:text-5xl font-bold leading-[1.1] ${THEME.text} mb-6`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            VAT-aware invoicing for the UK & EU
          </motion.h1>

          <motion.p
            className={`text-lg ${THEME.muted} mb-8`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Simple, fast, and compliant invoice generation with token-based pricing. 
            No subscriptions, no hidden fees, no data selling.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button href="/generator" size="lg">
              Open invoice generator
            </Button>
            <Button variant="outline" href="/pricing" size="lg">
              Top up tokens
            </Button>
          </motion.div>
        </motion.div>
      </Section>

      {/* What we do */}
      <Section className="py-16 bg-slate-50/50">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold ${THEME.text} mb-8 text-center`}>
            What we do
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Single-column form</h3>
                  <p className="text-slate-600 text-sm">Streamlined invoice creation with all fields in one place. No complex wizards or multiple steps.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Live PDF preview</h3>
                  <p className="text-slate-600 text-sm">See exactly how your invoice will look before generating. Real-time updates as you type.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">VAT modes</h3>
                  <p className="text-slate-600 text-sm">Built-in support for UK and EU VAT calculations. Automatic rate detection and compliance.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Token system</h3>
                  <p className="text-slate-600 text-sm">Pay only for what you use. No monthly subscriptions, no hidden fees, tokens never expire.</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </Section>

      {/* Why tokens */}
      <Section className="py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
              Why tokens (no subscriptions)
            </h2>
            <p className={`text-lg ${THEME.muted}`}>
              Traditional subscription models don't work for everyone. We believe in fair, transparent pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Pay-as-you-go</h3>
              <p className="text-slate-600 text-sm">Only pay for invoices you actually create. No monthly commitments or unused credits.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Scale up/down</h3>
              <p className="text-slate-600 text-sm">Buy more tokens when busy, use fewer when quiet. Your usage, your control.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Never expire</h3>
              <p className="text-slate-600 text-sm">Your tokens are yours forever. Use them today, next month, or next year.</p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Principles */}
      <Section className="py-16 bg-slate-50/50">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
              Our principles
            </h2>
            <p className={`text-lg ${THEME.muted}`}>
              The values that guide everything we build
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Accuracy</h3>
              <p className="text-slate-600 text-sm">Every calculation is precise. Every VAT rate is current. Every invoice is compliant.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Speed</h3>
              <p className="text-slate-600 text-sm">Create professional invoices in 30 seconds. No waiting, no delays, no complexity.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Privacy-by-design</h3>
              <p className="text-slate-600 text-sm">Your data stays yours. We don't sell it, share it, or use it for advertising.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Simplicity</h3>
              <p className="text-slate-600 text-sm">Clean interface, clear pricing, straightforward features. No bloat, no confusion.</p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Trust & Security */}
      <Section className="py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
              Trust & Security
            </h2>
            <p className={`text-lg ${THEME.muted}`}>
              Your data security and privacy are our top priorities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Data Protection</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>End-to-end encryption for all data transmission</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>EU/UK hosting with GDPR compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No card details stored on our servers</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Regular security audits and updates</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Compliance & Monitoring</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Security Details</h4>
                  <Link href="/security" className="text-blue-600 hover:underline text-sm" onClick={handleSecurityClick}>
                    View our security practices →
                  </Link>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Service Status</h4>
                  <Link href="/status" className="text-blue-600 hover:underline text-sm">
                    Check system status →
                  </Link>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-slate-500">
                    We're committed to transparency. All security practices and incident reports are publicly available.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </Section>

      {/* Company Details */}
      <Section className="py-16 bg-slate-50/50">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
              Company details
            </h2>
          </div>

          <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900 mb-4">PREPARING BUSINESS LTD</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Company Registration: [Registration Number]</p>
                <p>VAT Number: [VAT Number]</p>
                <p>Registered Address:</p>
                <p className="font-medium">Dept 6189, 43 Owston Road<br />
                Carcroft, Doncaster<br />
                UK, DN6 8DA</p>
                <p className="pt-4">
                  <a href="mailto:info@invoicerly.co.uk" className="text-blue-600 hover:underline">
                    info@invoicerly.co.uk
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>

      {/* Press Kit */}
      <Section className="py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
              Press kit
            </h2>
            <p className={`text-lg ${THEME.muted}`}>
              Brand assets and resources for media and partners
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Logo Assets</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Logo (SVG)</span>
                  <Button variant="outline" size="sm" onClick={handlePressDownload}>
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Logo (PNG)</span>
                  <Button variant="outline" size="sm" onClick={handlePressDownload}>
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Favicon</span>
                  <Button variant="outline" size="sm" onClick={handlePressDownload}>
                    Download
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Color Palette</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded border"></div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Primary Blue</div>
                    <div className="text-slate-600">#2563eb</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded border"></div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Accent Green</div>
                    <div className="text-slate-600">#059669</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 rounded border"></div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Text Dark</div>
                    <div className="text-slate-600">#0f172a</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-500 rounded border"></div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Text Muted</div>
                    <div className="text-slate-600">#64748b</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </Section>

      {/* 30-second demo */}
      <Section className="py-16 bg-slate-50/50">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
              30-second demo
            </h2>
            <p className={`text-lg ${THEME.muted}`}>
              See how easy it is to create professional invoices
            </p>
          </div>

          <Card className="p-8">
            <DemoPreview />
          </Card>
        </motion.div>
      </Section>

      {/* Contact CTA */}
      <Section className="py-16">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-3xl font-bold ${THEME.text} mb-4`}>
            Questions? We're here to help
          </h2>
          <p className={`text-lg ${THEME.muted} mb-8`}>
            Get in touch with our team for support, partnerships, or media inquiries
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="mailto:info@invoicerly.co.uk" size="lg">
              Contact us
            </Button>
            <Button variant="outline" href="/contact" size="lg">
              Contact form
            </Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
