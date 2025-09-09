'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <motion.footer
      className="py-10 border-t border-black/10 mt-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-2">Product</div>
            <div className="grid gap-1 text-slate-700">
              <Link href="/generator" className="hover:underline">Invoice Generator</Link>
              <Link href="/pricing" className="hover:underline">Pricing</Link>
              <Link href="/token-calculator" className="hover:underline">Token Calculator</Link>
              <a className="hover:underline" href="#" aria-disabled>Changelog</a>
              <a className="hover:underline" href="#" aria-disabled>Status</a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Help</div>
            <div className="grid gap-1 text-slate-700">
              <Link href="/help/faq" className="hover:underline">FAQ</Link>
              <Link href="/help/getting-started" className="hover:underline">Getting Started</Link>
              <Link href="/help/billing-tokens" className="hover:underline">Billing & Tokens</Link>
              <Link href="/help/troubleshooting" className="hover:underline">Troubleshooting</Link>
              <a className="hover:underline" href="#" aria-disabled>VAT Guide</a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Legal</div>
            <div className="grid gap-1 text-slate-700">
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <Link href="/terms" className="hover:underline">Terms</Link>
              <Link href="/cookies" className="hover:underline">Cookie</Link>
              <Link href="/refund" className="hover:underline">Refund</Link>
              <a className="hover:underline" href="#" aria-disabled>DPA</a>
              <a className="hover:underline" href="#" aria-disabled>Subprocessors</a>
              <a className="hover:underline" href="#" aria-disabled>Accessibility</a>
              <a className="hover:underline" href="#" aria-disabled>Security</a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Company</div>
            <div className="grid gap-1 text-slate-700">
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Meta</div>
            <div className="grid gap-2 text-slate-700">
              <div className="flex items-center gap-3">
                <a href="#" aria-label="Instagram" className="h-8 w-8 rounded-full border border-black/10 flex items-center justify-center">IG</a>
                <a href="#" aria-label="LinkedIn" className="h-8 w-8 rounded-full border border-black/10 flex items-center justify-center">in</a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between text-xs text-slate-600">
          <div>(c) {new Date().getFullYear()} Invoicerly - All rights reserved</div>
          <div>Made in UK</div>
        </div>
      </section>
    </motion.footer>
  );
}
