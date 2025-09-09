'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

type IssueCategory = 'payments' | 'tokens' | 'pdf-email' | 'vat' | 'login' | 'generator';
type IssueStatus = 'open' | 'solved';

interface TroubleshootingIssue {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  steps: string[];
  links: { text: string; href: string }[];
  tags: string[];
}

const ISSUES: TroubleshootingIssue[] = [
  {
    id: 'payment-failed',
    title: 'Payment failed',
    category: 'payments',
    description: 'Your payment was declined or tokens were not added to your account.',
    steps: [
      'Check your billing address matches your card',
      'Try a different payment method',
      'Wait 2-3 minutes for processing',
      'If charged but no tokens: we\'ll add them automatically within 10 minutes',
      'If still no tokens after 10 minutes: contact support with receipt'
    ],
    links: [
      { text: 'Try again', href: '/pricing' },
      { text: 'Contact support', href: '/contact' }
    ],
    tags: ['payment', 'declined', 'billing']
  },
  {
    id: 'not-enough-tokens',
    title: 'Not enough tokens',
    category: 'tokens',
    description: 'You don\'t have enough tokens to create or send an invoice.',
    steps: [
      'Check your token balance in Dashboard',
      'Drafting and previewing invoices is free',
      'Tokens are only deducted when you Issue/Send/Download',
      'Top up your account with more tokens',
      'Each invoice costs exactly 10 tokens'
    ],
    links: [
      { text: 'View balance', href: '/dashboard' },
      { text: 'Buy tokens', href: '/pricing' }
    ],
    tags: ['tokens', 'balance', 'insufficient']
  },
  {
    id: 'email-not-delivered',
    title: 'Email not delivered',
    category: 'pdf-email',
    description: 'Your invoice email was not received by the client.',
    steps: [
      'Verify the client email address is correct',
      'Check your "Sent" folder for delivery confirmation',
      'Ask client to check spam/junk folder',
      'Try sending a shareable link instead of PDF attachment',
      'Use read receipts (Pro/Business plans) to track delivery'
    ],
    links: [
      { text: 'Resend invoice', href: '/dashboard' },
      { text: 'Email settings', href: '/generator' }
    ],
    tags: ['email', 'delivery', 'spam']
  },
  {
    id: 'pdf-looks-wrong',
    title: 'PDF looks wrong',
    category: 'pdf-email',
    description: 'The generated PDF has formatting issues or missing elements.',
    steps: [
      'Check currency and date format settings (UK/EU toggle)',
      'Verify logo format (PNG/JPG recommended)',
      'For printing: disable "shrink to fit" in browser',
      'For Cyrillic text: use built-in fonts only',
      'Ensure all required fields are filled'
    ],
    links: [
      { text: 'Regenerate PDF', href: '/generator' },
      { text: 'Company settings', href: '/generator' }
    ],
    tags: ['pdf', 'formatting', 'logo']
  },
  {
    id: 'reverse-charge-missing',
    title: 'Reverse charge text missing',
    category: 'vat',
    description: 'Reverse charge note is not appearing on your invoice.',
    steps: [
      'Select "intra-EU 0%" or "UK↔EU cross-border" VAT mode',
      'Ensure both your and client VAT IDs are entered',
      'Verify client is in a different EU country',
      'Check that both VAT numbers are valid',
      'The note appears automatically when conditions are met'
    ],
    links: [
      { text: 'VAT settings', href: '/generator' },
      { text: 'VAT Guide', href: '/help/faq' }
    ],
    tags: ['vat', 'reverse-charge', 'eu']
  },
  {
    id: 'invoice-number-gap',
    title: 'Invoice number gap',
    category: 'generator',
    description: 'Invoice numbers are not sequential or have gaps.',
    steps: [
      'Check your invoice prefix and next number settings',
      'We don\'t reuse numbers from deleted invoices',
      'Each invoice gets the next available number',
      'Gaps are normal if invoices were deleted',
      'You can manually set the next number if needed'
    ],
    links: [
      { text: 'Invoice settings', href: '/generator' },
      { text: 'Numbering guide', href: '/help/faq' }
    ],
    tags: ['numbering', 'sequence', 'prefix']
  },
  {
    id: 'login-2fa-issues',
    title: 'Login/2FA issues',
    category: 'login',
    description: 'Cannot log in or two-factor authentication problems.',
    steps: [
      'Check your device time is correct',
      'Clear browser cookies and cache',
      'Don\'t block strictly necessary cookies',
      'Try resetting your password',
      'Check if 2FA app is working properly'
    ],
    links: [
      { text: 'Reset password', href: '/auth/signin' },
      { text: 'Account recovery', href: '/contact' }
    ],
    tags: ['login', '2fa', 'password']
  },
  {
    id: 'slow-or-stuck',
    title: 'Slow or stuck',
    category: 'generator',
    description: 'The application is running slowly or appears frozen.',
    steps: [
      'Clear your browser cache and cookies',
      'Disable browser extensions temporarily',
      'Check your internet connection',
      'Try refreshing the page',
      'Check our system status page'
    ],
    links: [
      { text: 'System status', href: '/status' },
      { text: 'Report issue', href: '/contact' }
    ],
    tags: ['slow', 'performance', 'frozen']
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Issues', color: 'bg-slate-100 text-slate-800' },
  { id: 'payments', label: 'Payments', color: 'bg-green-100 text-green-800' },
  { id: 'tokens', label: 'Tokens', color: 'bg-blue-100 text-blue-800' },
  { id: 'pdf-email', label: 'PDF/Email', color: 'bg-purple-100 text-purple-800' },
  { id: 'vat', label: 'VAT', color: 'bg-orange-100 text-orange-800' },
  { id: 'login', label: 'Login', color: 'bg-red-100 text-red-800' },
  { id: 'generator', label: 'Generator', color: 'bg-indigo-100 text-indigo-800' },
] as const;

export default function TroubleshootingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [solvedIssues, setSolvedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'ts_page_view', {
        page_title: 'Troubleshooting',
      });
    }
  }, []);

  const filteredIssues = useMemo(() => {
    let filtered = ISSUES;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(issue => issue.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const toggleExpanded = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  const markSolved = (issueId: string) => {
    setSolvedIssues(prev => new Set([...prev, issueId]));
    
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'ts_issue_solved', {
        issue_id: issueId,
      });
    }
  };

  const handleIssueView = (issueId: string) => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'ts_issue_view', {
        issue_id: issueId,
      });
    }
  };

  const handleOpenTicket = () => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'ts_open_ticket', {
        action: 'open_ticket',
      });
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Troubleshooting
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Quick solutions to common problems. Find and fix issues in minutes.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-6">
            <Input
              placeholder="Search problems (e.g. payment failed, PDF issues)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-lg py-3"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as IssueCategory | 'all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Issues Grid */}
        <div className="grid gap-6">
          {filteredIssues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isExpanded={expandedIssues.has(issue.id)}
              isSolved={solvedIssues.has(issue.id)}
              onToggle={() => {
                toggleExpanded(issue.id);
                handleIssueView(issue.id);
              }}
              onMarkSolved={() => markSolved(issue.id)}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No issues found</h3>
            <p className="text-slate-600 mb-6">
              Try different keywords or browse by category
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Escalation */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Still stuck?
              </h3>
              <p className="text-slate-600 mb-6">
                Can't find a solution? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  href="/contact" 
                  size="lg"
                  onClick={handleOpenTicket}
                >
                  Open a ticket
                </Button>
                <Button 
                  href="mailto:info@invoicerly.co.uk" 
                  variant="outline" 
                  size="lg"
                >
                  Email support
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function IssueCard({
  issue,
  isExpanded,
  isSolved,
  onToggle,
  onMarkSolved,
}: {
  issue: TroubleshootingIssue;
  isExpanded: boolean;
  isSolved: boolean;
  onToggle: () => void;
  onMarkSolved: () => void;
}) {
  const category = CATEGORIES.find(c => c.id === issue.category);

  return (
    <Card className={`overflow-hidden ${isSolved ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full text-left p-6 hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {issue.title}
              </h3>
              {category && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                  {category.label}
                </span>
              )}
              {isSolved && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Solved
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm">
              {issue.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {issue.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-slate-200">
              <div className="pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Solution steps:</h4>
                <ol className="space-y-2 mb-6">
                  {issue.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-slate-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex flex-wrap gap-2 mb-4">
                  {issue.links.map((link, index) => (
                    <Button
                      key={index}
                      href={link.href}
                      variant="outline"
                      size="sm"
                    >
                      {link.text}
                    </Button>
                  ))}
                </div>

                {!isSolved && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <Button
                      onClick={onMarkSolved}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Mark as solved
                    </Button>
                    <span className="text-xs text-slate-500">
                      Did this solve your problem?
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}


