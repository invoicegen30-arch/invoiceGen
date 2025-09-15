'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/data';
import { THEME } from '@/lib/theme';

export default function Pricing() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<'GBP'|'EUR'|'AUD'>(()=>{
    if (typeof window === 'undefined') return 'GBP';
    try { return (localStorage.getItem('currency') as 'GBP'|'EUR'|'AUD') || 'GBP'; } catch { return 'GBP'; }
  });

  useEffect(()=>{
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'AUD')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const formatPrice = (priceText: string) => {
    const match = priceText.match(/([0-9]+(?:\.[0-9]+)?)/);
    const amount = match ? match[1] : '0';
    return `${currency} ${amount}`;
  };

  return (
    <Section id="pricing" className="py-14">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Plans</h2>
        <p className="mt-2 text-slate-600">Start free, upgrade when you're ready.</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className={plan.popular ? 'md:-mt-4' : ''}
          >
            <Card className={`${plan.popular ? 'shadow-md border-black/10' : ''} flex flex-col justify-between h-full`}>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.popular && (
                    <motion.span
                      className={`text-xs rounded-full px-2 py-1 ${THEME.primary.text} bg-black/5`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      POPULAR
                    </motion.span>
                  )}
                </div>
                <div className="mt-3 text-3xl font-bold">
                  {formatPrice(plan.price)}
                  <span className="text-base font-normal text-slate-500">/one-time</span>
                </div>
                {/* Tokens line (GBP baseline) */}
                <TokensLine planName={plan.name} priceText={formatPrice(plan.price)} />
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {plan.points.map((point, pointIndex) => (
                    <motion.li
                      key={point}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + pointIndex * 0.1, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <span>-</span>
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Button className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <CustomHomeCard currency={currency} />
        </motion.div>
      </div>
      <p className="mt-4 text-xs text-slate-500 text-center">Prices exclude VAT. Tokens deposit to your account after purchase (signed-in users only).</p>
    </Section>
  );
}

function TokensLine({ planName, priceText }: { planName: string; priceText: string }) {
  const extract = () => {
    const match = priceText.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return 0;
    return parseFloat(match[1]);
  };
  const TOKENS_PER_UNIT = 100;
  const TOKENS_PER_INVOICE = 10;
  let tokens = 0;
  if (planName.toLowerCase() === 'free') tokens = 0;
  else tokens = Math.round(extract() * TOKENS_PER_UNIT);
  const invoices = Math.round(tokens / TOKENS_PER_INVOICE);
  return (
    <div className="mt-1 text-xs text-slate-600">≈ {tokens} tokens (~{invoices} invoices)</div>
  );
}

function CustomHomeCard({ currency }: { currency: 'GBP'|'EUR'|'AUD' }) {
  const [price, setPrice] = useState<number>(5);
  const min = 5;
  const TOKENS_PER_UNIT = 100;
  const TOKENS_PER_INVOICE = 10;
  const tokens = Math.max(0, Math.round(price * TOKENS_PER_UNIT));
  const invoices = Math.round(tokens / TOKENS_PER_INVOICE);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = parseFloat(e.target.value || '0');
    if (isNaN(v)) return;
    setPrice(Math.max(min, v));
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Custom</h3>
          <span className="text-xs rounded-full px-2 py-1 bg-slate-100 border border-black/10 text-slate-700">EARLY / SUPPORTER</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">{currency}</span>
          <input
            type="number"
            min={min}
            step={1}
            value={price}
            onChange={onChange}
            className="w-24 text-3xl font-bold bg-transparent border-b border-black/10 focus:outline-none focus:ring-0"
            aria-label="Custom price"
          />
          <span className="text-base font-normal text-slate-500">/one-time</span>
        </div>
        <div className="mt-1 text-xs text-slate-600">= {tokens} tokens (~{invoices} invoices)</div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>Top up your account</li>
          <li>No subscription — pay what you need</li>
          <li>Min {currency} 5</li>
        </ul>
      </div>
      <div className="mt-6">
        <Button className="w-full" size="lg">Buy tokens</Button>
      </div>
    </Card>
  );
}



