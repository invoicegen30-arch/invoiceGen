'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';
import { calculateTokens, convertFromGBP, formatCurrency, type Currency } from '@/lib/currency';
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import { toast } from "sonner";


// Safe number formatting that works consistently on server and client
function formatNumber(num: number): string {
  if (num >= 1000) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  return num.toString();
}

// Format currency with more precision for small amounts (like cost per invoice)
function formatCurrencyPrecise(amount: number, currency: Currency): string {
  const symbols = {
    GBP: '£',
    EUR: '€',
    USD: '$',
    AUD: 'A$',
    CAD: 'C$',
    NZD: 'NZ$',
  };
  const symbol = symbols[currency] || currency;

  // Use 3 decimal places for amounts < 1, 2 decimal places for larger amounts
  const decimals = amount < 1 ? 3 : 2;
  return `${symbol}${amount.toFixed(decimals)}`;
}

const MIN_AMOUNT_GBP = 5; // Base amount in GBP
const MAX_AMOUNT_GBP = 500; // Base amount in GBP

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const signedIn = status === "authenticated";
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'calc_open', {
        page_title: 'Token Calculator',
      });
    }
  }, []);

  // Get min/max amounts in current currency
  const minAmount = convertFromGBP(MIN_AMOUNT_GBP, currency);
  const maxAmount = convertFromGBP(MAX_AMOUNT_GBP, currency);

  // Calculate tokens and invoices using proper currency conversion
  const tokens = calculateTokens(amount, currency);
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
    const clampedValue = Math.max(minAmount, Math.min(maxAmount, numValue));

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
    const newAmount = Math.max(minAmount, Math.min(maxAmount, newInvoices * 0.1));
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
    if (!signedIn) {
      toast.warning("Please sign in to continue");
      return router.push("/auth/signin?mode=login");
    }

    try {
      // Зберігаємо дані для сторінки /checkout
      const checkoutData = {
        amount,
        currency,
        description: `Top-up ${amount} ${currency}`,
        tokens,
        email: session?.user?.email || "guest@example.com",
      };

      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

      // Перенаправлення на сторінку checkout
      router.push("/checkout");
    } catch (err) {
      console.error("Checkout redirect error:", err);
      toast.error("Something went wrong. Please try again.");
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
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'USD', label: 'USD ($)' }
                ]}
                value={currency}
                onChange={handleCurrencyChange}
              />
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Amount ({currency})
              </label>
              <div className="space-y-3">
                <Input
                  type="number"
                  min={minAmount}
                  max={maxAmount}
                  step="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-lg"
                />
                <input
                  type="range"
                  min={minAmount}
                  max={maxAmount}
                  step="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{formatCurrency(minAmount, currency)}</span>
                  <span>{formatCurrency(maxAmount, currency)}</span>
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
            {amount < minAmount && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Minimum amount is {formatCurrency(minAmount, currency)}
                </p>
              </div>
            )}

            {amount >= maxAmount && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Need more than {formatCurrency(maxAmount, currency)}?
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
                  {formatNumber(tokens)}
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
                  {formatCurrencyPrecise(effectiveCostPerInvoice, currency)}
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
                Top up {formatCurrency(amount, currency)}
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
          <div className="grid md:grid-cols-3 gap-6">
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
              amount={11.50}
              onSelect={() => {
                setCurrency('EUR');
                setAmount(11.50);
              }}
            />
            <ExampleCard
              currency="USD"
              amount={13.30}
              onSelect={() => {
                setCurrency('USD');
                setAmount(13.30);
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
  const tokens = calculateTokens(amount, currency);
  const invoices = Math.floor(tokens / 10);
  const costPerInvoice = amount / invoices;

  return (
    <div
      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm"
      onClick={onSelect}
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900 mb-2">
          {formatCurrency(amount, currency)}
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          <div>{formatNumber(tokens)} tokens</div>
          <div>≈ {invoices} invoices</div>
          <div className="text-emerald-600 font-medium">
            {formatCurrencyPrecise(costPerInvoice, currency)} per invoice
          </div>
        </div>
      </div>
    </div>
  );
}
