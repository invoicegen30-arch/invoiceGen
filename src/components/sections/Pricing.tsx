'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/data';
import { THEME } from '@/lib/theme';
import { calculateTokens, formatCurrency, convertFromGBP, convertToGBP, type Currency } from '@/lib/currency';

function money(n: number, currency: Currency) {
  const locale = currency === 'GBP' ? 'en-GB' : currency === 'EUR' ? 'en-IE' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);
}

function AnimatedPrice({ amountInGBP, currency }: { amountInGBP: number; currency: Currency }) {
  const convertedAmount = useMemo(() => convertFromGBP(amountInGBP, currency), [amountInGBP, currency]);
  const [display, setDisplay] = useState(convertedAmount);
  const displayRef = useRef(convertedAmount);
  
  // Count-up animation (400ms)
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 400;
    const startValue = displayRef.current;
    const endValue = convertedAmount;
    
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const currentValue = startValue + (endValue - startValue) * p;
      setDisplay(currentValue);
      displayRef.current = currentValue;
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [convertedAmount]);
  
  return (
    <div className="text-3xl font-bold">
      {money(display, currency)}
      <span className="text-base font-normal text-slate-500">/one-time</span>
    </div>
  );
}

export default function Pricing() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [currency, setCurrency] = useState<Currency>(()=>{
    if (typeof window === 'undefined') return 'GBP';
    try { return (localStorage.getItem('currency') as Currency) || 'GBP'; } catch { return 'GBP'; }
  });

  useEffect(()=>{
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'USD')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const formatPrice = (priceText: string) => {
    const amountInGBP = parseFloat(priceText);
    const convertedAmount = convertFromGBP(amountInGBP, currency);
    return formatCurrency(convertedAmount, currency);
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
        <p className="mt-2 text-slate-600">Buy tokens when you need them — they never expire.</p>
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
                <div className="mt-3">
                  <AnimatedPrice amountInGBP={parseFloat(plan.price)} currency={currency} />
                </div>
                {/* Tokens line with currency conversion */}
                <TokensLine planName={plan.name} priceText={plan.price} currency={currency} />
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

function TokensLine({ planName, priceText, currency }: { planName: string; priceText: string; currency: Currency }) {
  const amountInGBP = parseFloat(priceText); // priceText contains base GBP amount
  const TOKENS_PER_INVOICE = 10;
  let tokens = 0;
  if (planName.toLowerCase() === 'free') tokens = 0;
  else tokens = calculateTokens(amountInGBP, 'GBP'); // Always calculate from GBP base
  const invoices = Math.round(tokens / TOKENS_PER_INVOICE);
  return (
    <div className="mt-1 text-xs text-slate-600">≈ {tokens} tokens (~{invoices} invoices)</div>
  );
}

function CustomHomeCard({ currency }: { currency: Currency }) {
  const [price, setPrice] = useState<number>(0.01);
  const [prevCurrency, setPrevCurrency] = useState<Currency>(currency);
  const min = 0.01;
  const TOKENS_PER_INVOICE = 10;
  const tokens = Math.max(0, calculateTokens(price, currency));
  const invoices = Math.round(tokens / TOKENS_PER_INVOICE);

  // Update price when currency changes (convert from previous currency to new)
  useEffect(() => {
    if (prevCurrency !== currency) {
      const gbpAmount = convertToGBP(price, prevCurrency);
      const newPrice = convertFromGBP(gbpAmount, currency);
      setPrice(Math.max(min, newPrice));
      setPrevCurrency(currency);
    }
  }, [currency, prevCurrency, price, min]);

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
            step={0.01}
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
          <li>Min {formatCurrency(0.01, currency)}</li>
        </ul>
      </div>
      <div className="mt-6">
        <Button className="w-full" size="lg">Buy tokens</Button>
      </div>
    </Card>
  );
}



