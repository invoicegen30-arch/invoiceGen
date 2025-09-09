'use client';

import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { FEATURES } from '@/lib/data';
import { LayoutPanelLeft, Eye, Banknote, Save, Hash } from 'lucide-react';
import { CurrencyPatternBG, InvoiceNumberPatternBG } from '@/components/graphics/Patterns';

const ICONS_BY_ID: Record<string, (props: any) => JSX.Element> = {
  singleColumn: (props: any) => <LayoutPanelLeft {...props} />,
  livePreview: (props: any) => <Eye {...props} />,
  multiCurrency: (props: any) => <Banknote {...props} />,
  autoSave: (props: any) => <Save {...props} />,
};

export default function WhyUs() {
  return (
    <Section className="py-12">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Why choose us</h2>
        <p className="mt-2 text-slate-600">Fewer clicks and fewer errors when invoicing.</p>
      </motion.div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature, index) => {
          const Icon = ICONS_BY_ID[feature.id] || ((p: any) => <Hash {...p} />);
          const showCurrencyPattern = feature.id === 'multiCurrency';
          const showInvoicePattern = feature.id === 'autoSave';
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden transition-all duration-200 motion-reduce:transition-none hover:-translate-y-[2px] hover:shadow-md hover:border-slate-300 focus-within:ring-2 focus-within:ring-blue-600/30 focus-within:outline-none" padding="md">
                {/* Accent top line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-b from-blue-600 to-transparent" aria-hidden="true" />
                {/* Subtle patterns */}
                {showCurrencyPattern && <CurrencyPatternBG className="text-slate-900" />}
                {showInvoicePattern && <InvoiceNumberPatternBG className="text-slate-900" />}

                <div className="flex items-center gap-2">
                  <Icon size={20} className="opacity-80" aria-hidden="true" />
                  <span className="sr-only">{feature.title}</span>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-700">{feature.description}</p>
                {feature.metric && (
                  <p className="mt-1 text-[12px] leading-5 text-slate-500">{feature.metric}</p>
                )}

                {/* Keyboard focus target */}
                <div tabIndex={0} aria-hidden="true" className="absolute inset-0 outline-none" />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}



