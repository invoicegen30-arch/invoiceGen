'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Section from '@/components/layout/Section';
import InvoiceForm from '@/components/generator/InvoiceForm';

export default function GeneratorPage() {
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const gated = !signedIn;

  return (
    <motion.div
      className="bg-slate-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="min-h-[calc(100vh-64px)]">
        {gated && (
          <motion.div
            className="bg-amber-50 border-b border-amber-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Section className="py-2 text-sm text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Note:</span>
                <span>Guest mode: export, email and share link are available after sign-up.</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-white/70 border-black/10">
                  UK-first
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] bg-white/70 border-black/10">
                  EU-ready
                </span>
              </div>
            </Section>
          </motion.div>
        )}

        <Section className="py-6">
          <InvoiceForm signedIn={signedIn} />
      </Section>
    </main>
  </motion.div>
);
}



