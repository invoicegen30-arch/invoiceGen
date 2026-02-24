'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const TOKEN_PACKAGES = [
  { amount: 10, currency: 'GBP', tokens: 1000, invoices: 100, costPerInvoice: 0.10 },
  { amount: 50, currency: 'GBP', tokens: 5000, invoices: 500, costPerInvoice: 0.10 },
  { amount: 100, currency: 'GBP', tokens: 10000, invoices: 1000, costPerInvoice: 0.10 },
  { amount: 11.50, currency: 'EUR', tokens: 1000, invoices: 100, costPerInvoice: 0.115 },
  { amount: 57.50, currency: 'EUR', tokens: 5000, invoices: 500, costPerInvoice: 0.115 },
  { amount: 115, currency: 'EUR', tokens: 10000, invoices: 1000, costPerInvoice: 0.115 },
  { amount: 13.30, currency: 'USD', tokens: 1000, invoices: 100, costPerInvoice: 0.133 },
  { amount: 66.50, currency: 'USD', tokens: 5000, invoices: 500, costPerInvoice: 0.133 },
  { amount: 133, currency: 'USD', tokens: 10000, invoices: 1000, costPerInvoice: 0.133 },
];

const LEDGER_SAMPLE = [
  { date: '2024-01-15', type: 'Top-up', delta: 1000, balance: 1000, currency: 'GBP', amount: 10, receiptUrl: '#' },
  { date: '2024-01-15', type: 'Invoice', delta: -10, balance: 990, currency: 'GBP', amount: null, receiptUrl: null, invoiceNumber: 'INV-001' },
  { date: '2024-01-16', type: 'Invoice', delta: -10, balance: 980, currency: 'GBP', amount: null, receiptUrl: null, invoiceNumber: 'INV-002' },
  { date: '2024-01-17', type: 'Invoice', delta: -10, balance: 970, currency: 'GBP', amount: null, receiptUrl: null, invoiceNumber: 'INV-003' },
  { date: '2024-01-18', type: 'Top-up', delta: 5000, balance: 5970, currency: 'GBP', amount: 50, receiptUrl: '#' },
  { date: '2024-01-18', type: 'Invoice', delta: -10, balance: 5960, currency: 'GBP', amount: null, receiptUrl: null, invoiceNumber: 'INV-004' },
];

export default function BillingTokensPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<'GBP' | 'EUR' | 'USD'>('GBP');
  const [customAmount, setCustomAmount] = useState<number>(10);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'billing_view', {
        page_title: 'Billing & Tokens',
      });
    }
  }, []);

  const handleTopUpClick = (amount?: number) => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'billing_click_topup', {
        amount: amount || customAmount,
        currency: selectedCurrency,
      });
    }
  };

  const calculateTokens = (amount: number) => Math.round(amount * 100);
  const calculateInvoices = (tokens: number) => Math.round(tokens / 10);
  const calculateCostPerInvoice = (amount: number) => (amount / calculateInvoices(calculateTokens(amount))).toFixed(2);

  const filteredPackages = TOKEN_PACKAGES.filter(pkg => pkg.currency === selectedCurrency);

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Billing & Tokens</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Understand our pay-as-you-go model, token pricing, and billing system.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">How it works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Pay-as-you-go</h3>
                    <p className="text-sm text-slate-600">No subscriptions or monthly fees</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🪙</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">1 {selectedCurrency} = 100 tokens</h3>
                    <p className="text-sm text-slate-600">Simple conversion rate</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📄</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">1 invoice = 10 tokens</h3>
                    <p className="text-sm text-slate-600">Fixed cost per invoice</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>Tokens never expire</strong> - use them whenever you need to create invoices. 
                    Drafting and previewing invoices is completely free.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Token Calculator</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Amount ({selectedCurrency})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="5"
                        step="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value as 'GBP' | 'EUR' | 'USD')}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Tokens</span>
                      <span className="font-semibold text-slate-900">{calculateTokens(customAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Invoices</span>
                      <span className="font-semibold text-slate-900">≈{calculateInvoices(calculateTokens(customAmount))}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-emerald-700">Cost per invoice</span>
                      <span className="font-semibold text-emerald-900">{selectedCurrency} {calculateCostPerInvoice(customAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">How to top up</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredPackages.map((pkg, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 mb-1">
                          {pkg.currency} {pkg.amount}
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          {pkg.tokens.toLocaleString()} tokens
                        </div>
                        <div className="text-xs text-slate-500">
                          ≈{pkg.invoices} invoices
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 font-semibold text-sm">💡 Custom amounts</div>
                    <p className="text-blue-800 text-sm">
                      You can top up any amount from {selectedCurrency}5 to {selectedCurrency}10,000.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">VAT & Receipts</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">VAT calculation</h3>
                    <p className="text-slate-700 text-sm mb-3">
                      VAT is calculated at checkout based on your business location and VAT registration status.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4">
                      <li>• UK businesses: 20% VAT</li>
                      <li>• EU businesses: Local VAT rate</li>
                      <li>• EU B2B with valid VAT ID: Reverse charge applies (0% VAT)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Receipts & Records</h3>
                    <p className="text-slate-700 text-sm mb-3">
                      All transactions are recorded in your token ledger. You can access:
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4">
                      <li>• Transaction history and receipts in your Dashboard</li>
                      <li>• Transaction history in your Dashboard</li>
                      <li>• Detailed ledger with invoice numbers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Token Ledger Sample</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-slate-700">Date</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-700">Type</th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-700">Delta</th>
                        <th className="text-right px-3 py-2 font-semibold text-slate-700">Balance</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-700">Invoice #</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-700">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LEDGER_SAMPLE.map((entry, index) => (
                        <tr key={index} className="border-t border-slate-200">
                          <td className="px-3 py-2 text-slate-600">{entry.date}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.type === 'Top-up' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className={`px-3 py-2 text-right font-medium ${
                            entry.delta > 0 ? 'text-emerald-600' : 'text-slate-900'
                          }`}>
                            {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">{entry.balance.toLocaleString()}</td>
                          <td className="px-3 py-2 text-slate-600">{entry.invoiceNumber || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            {entry.receiptUrl ? (
                              <a href={entry.receiptUrl} className="text-emerald-600 hover:underline text-xs">
                                View
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Refunds</h2>
                <p className="text-slate-700 mb-4">
                  Unused tokens can be refunded within 14 days of purchase. Used tokens (for issued invoices) 
                  are non-refundable. All refunds are processed to the original payment method within 5-10 business days.
                </p>
                <Button href="/refund" variant="outline" size="sm">
                  View Refund Policy
                </Button>
              </div>
            </Card>

            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Methods & Limits</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Accepted Methods</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li>• Credit/Debit cards (Visa, Mastercard, Amex)</li>
                      <li>• Apple Pay</li>
                      <li>• Google Pay</li>
                      <li>• Bank transfer (for large amounts)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Limits</h3>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li>• Minimum: {selectedCurrency}5 per transaction</li>
                      <li>• Maximum: {selectedCurrency}10,000 per transaction</li>
                      <li>• Daily limit: {selectedCurrency}25,000</li>
                      <li>• Fraud protection: Automatic monitoring</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 font-semibold text-sm">⚠️ Payment Issues</div>
                    <p className="text-amber-800 text-sm">
                      If your payment is declined, check your card details and billing address. 
                      For large amounts, contact support for bank transfer options.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      href={`/pricing?amount=${customAmount}&currency=${selectedCurrency}`}
                      className="w-full"
                      onClick={() => handleTopUpClick()}
                    >
                      Top up tokens
                    </Button>
                    <Button 
                      href="/token-calculator" 
                      variant="outline" 
                      className="w-full"
                    >
                      Open Token Calculator
                    </Button>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Examples</h3>
                  <div className="space-y-3">
                    {filteredPackages.slice(0, 3).map((pkg, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-slate-900">
                          {pkg.currency} {pkg.amount} → {pkg.tokens.toLocaleString()} tokens
                        </div>
                        <div className="text-slate-600">
                          ≈{pkg.invoices} invoices → ≈{pkg.currency} {pkg.costPerInvoice.toFixed(2)} per invoice
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Need Help?</h3>
                  <div className="space-y-3 text-sm">
                    <Link href="/help/faq" className="block text-slate-600 hover:text-slate-900">
                      View FAQ
                    </Link>
                    <Link href="/contact" className="block text-slate-600 hover:text-slate-900">
                      Contact Support
                    </Link>
                    <Link href="/help/troubleshooting" className="block text-slate-600 hover:text-slate-900">
                      Troubleshooting
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
