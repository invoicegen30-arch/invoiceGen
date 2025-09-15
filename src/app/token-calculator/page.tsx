'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';

type Currency = 'GBP' | 'EUR' | 'AUD';

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 500;

const FAQ_ITEMS = [
  {
    question: 'Do tokens expire?',
    answer: 'No, tokens never expire. You can use them whenever you need to create invoices.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, unused tokens within 14 days are refundable. Used tokens are non-refundable. See our Refund Policy for details.'
  },
  {
    question: 'Where can I see my token history?',
    answer: 'Check your Dashboard → Token history for a complete ledger of all token transactions and usage.'
  }
];

export default function TokenCalculatorPage() {
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [amount, setAmount] = useState(50);
  const [invoicesNeeded, setInvoicesNeeded] = useState(5);
  const [isUpdatingFromAmount, setIsUpdatingFromAmount] = useState(false);
  const [isUpdatingFromInvoices, setIsUpdatingFromInvoices] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'calc_open', {
        page_title: 'Token Calculator',
      });
    }
  }, []);

  // Calculate tokens and invoices
  const tokens = amount * 100;
  const calculatedInvoices = Math.floor(tokens / 10);
  const effectiveCostPerInvoice = amount / calculatedInvoices;

  // Sync invoices needed with amount (only when amount changes and not from invoices input)
  useEffect(() => {
    if (!isUpdatingFromInvoices && !isUpdatingFromAmount) {
      const newInvoices = Math.floor(tokens / 10);
      if (newInvoices !== invoicesNeeded && newInvoices > 0) {
        setInvoicesNeeded(newInvoices);
      }
    }
  }, [amount, tokens, invoicesNeeded, isUpdatingFromInvoices, isUpdatingFromAmount]);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, numValue));
    
    setIsUpdatingFromAmount(true);
    setAmount(clampedValue);
    
    // Update invoices after amount change
    const newInvoices = Math.floor(clampedValue * 100 / 10);
    setInvoicesNeeded(newInvoices);
    
    setTimeout(() => {
      setIsUpdatingFromAmount(false);
    }, 0);
    
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'calc_change_amount', {
        amount: clampedValue,
        currency: currency,
      });
    }
  };

  const handleInvoicesChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const newInvoices = Math.max(1, numValue);
    
    setIsUpdatingFromInvoices(true);
    setInvoicesNeeded(newInvoices);
    
    // Update amount after invoices change
    const newAmount = Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, newInvoices * 0.1));
    setAmount(Math.round(newAmount * 100) / 100);
    
    setTimeout(() => {
      setIsUpdatingFromInvoices(false);
    }, 0);
  };

  const handleCurrencyChange = (value: string) => {
    const newCurrency = value as Currency;
    setCurrency(newCurrency);
    
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'calc_change_currency', {
        currency: newCurrency,
      });
    }
  };

  const handleTopUpClick = () => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'calc_topup_click', {
        amount: amount,
        currency: currency,
        tokens: tokens,
      });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/token-calculator?amount=${amount}&currency=${currency}`;
    navigator.clipboard.writeText(url);
    
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'calc_copy_link', {
        amount: amount,
        currency: currency,
      });
    }
  };

  const topUpUrl = `/pricing?amount=${amount}&currency=${currency}`;

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Token Calculator
          </h1>
          <p className="text-lg text-slate-600">
            Calculate how many tokens you need and see the effective cost per invoice
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Calculate Tokens
            </h2>
            
            {/* Currency Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Currency
              </label>
              <Segmented
                options={[
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'EUR', label: 'EUR (€)' }
                ]}
                value={currency}
                onChange={handleCurrencyChange}
              />
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Amount ({currency === 'GBP' ? '£' : '€'})
              </label>
              <div className="space-y-3">
                <Input
                  type="number"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-lg"
                />
                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{currency === 'GBP' ? '£' : '€'}5</span>
                  <span>{currency === 'GBP' ? '£' : '€'}500</span>
                </div>
              </div>
            </div>

            {/* Invoices Needed Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Invoices needed
              </label>
              <Input
                type="number"
                min="1"
                value={invoicesNeeded}
                onChange={(e) => handleInvoicesChange(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will automatically adjust the amount
              </p>
            </div>

            {/* Edge Cases */}
            {amount < MIN_AMOUNT && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Minimum amount is {currency === 'GBP' ? '£' : '€'}{MIN_AMOUNT}
                </p>
              </div>
            )}

            {amount >= MAX_AMOUNT && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Need more than {currency === 'GBP' ? '£' : '€'}{MAX_AMOUNT}? 
                  <a href="/contact" className="ml-1 underline hover:no-underline">
                    Contact us for bank transfer
                  </a>
                </p>
              </div>
            )}
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Results
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600">Tokens you'll get</span>
                <span className="text-2xl font-bold text-slate-900">
                  {tokens.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600">≈ Invoices</span>
                <span className="text-2xl font-bold text-slate-900">
                  {calculatedInvoices}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-200">
                <span className="text-slate-600">Effective cost per invoice</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {currency === 'GBP' ? '£' : '€'}{effectiveCostPerInvoice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Note:</strong> Prices exclude VAT. VAT is calculated at checkout based on your location and VAT status.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Button
                href={topUpUrl}
                size="lg"
                className="w-full"
                onClick={handleTopUpClick}
              >
                Top up {currency === 'GBP' ? '£' : '€'}{amount}
              </Button>
              
              <div className="flex gap-3">
                <Button
                  href="/generator"
                  variant="outline"
                  className="flex-1"
                >
                  Open Generator
                </Button>
                
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Examples */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Popular Examples
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <ExampleCard
              currency="GBP"
              amount={10}
              onSelect={() => {
                setCurrency('GBP');
                setAmount(10);
              }}
            />
            <ExampleCard
              currency="EUR"
              amount={50}
              onSelect={() => {
                setCurrency('EUR');
                setAmount(50);
              }}
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {item.question}
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {item.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </main>
  );
}

function ExampleCard({
  currency,
  amount,
  onSelect,
}: {
  currency: Currency;
  amount: number;
  onSelect: () => void;
}) {
  const tokens = amount * 100;
  const invoices = Math.floor(tokens / 10);
  const costPerInvoice = amount / invoices;

  return (
    <div 
      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm"
      onClick={onSelect}
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900 mb-2">
          {currency === 'GBP' ? '£' : '€'}{amount}
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          <div>{tokens.toLocaleString()} tokens</div>
          <div>≈ {invoices} invoices</div>
          <div className="text-emerald-600 font-medium">
            {currency === 'GBP' ? '£' : '€'}{costPerInvoice.toFixed(2)} per invoice
          </div>
        </div>
      </div>
    </div>
  );
}