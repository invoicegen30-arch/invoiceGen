'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import DemoPreview from '@/components/demo/DemoPreview';
import { THEME } from '@/lib/theme';

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <Section className="pt-10 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white/70 backdrop-blur border-black/10 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span>UK & EU VAT-ready</span>
              <span>·</span>
              <span>UK GDPR</span>
              <span>·</span>
              <span>PDF Export</span>
            </motion.div>

            <motion.h1
              className={`mt-5 text-4xl sm:text-5xl font-bold leading-[1.1] ${THEME.text}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Create invoices in 30 seconds. Simple. Fast. Compliant.
            </motion.h1>

            <motion.p
              className={`mt-4 text-lg ${THEME.muted}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              VAT-aware templates, multi-currency, live preview, and one-click sending.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Button href="#why-us" size="lg">
                Why choose us
              </Button>
              <Button variant="outline" href="#pricing" size="lg">
                Pricing & Comparison
              </Button>
            </motion.div>

            <motion.div
              className={`mt-6 grid grid-cols-3 gap-4 text-sm ${THEME.muted}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <span>SSL / UK GDPR</span>
              </div>
              <div className="flex items-center gap-2">
                <span>50+ currencies</span>
              </div>
              <div className="flex items-center gap-2">
                <span>UK & EU VAT</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <DemoPreview />
          </motion.div>
        </div>
      </Section>
    </div>
  );
}

