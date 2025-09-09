'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

type FAQCategory = 'tokens' | 'vat' | 'pdf' | 'account' | 'integrations';
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  top?: boolean;
};

const FAQ_DATA: FAQItem[] = [
  // Top Questions
  {
    id: 'pricing',
    question: 'How does pricing work?',
    answer: 'Pay-as-you-go. 1 GBP/EUR = 100 tokens. Issuing an invoice costs 10 tokens. Tokens never expire.',
    category: 'tokens',
    top: true,
  },
  {
    id: 'vat-modes',
    question: 'What VAT modes are supported?',
    answer: 'Domestic, intra-EU 0% (reverse charge), UK↔EU cross-border, export.',
    category: 'vat',
    top: true,
  },
  {
    id: 'drafting-free',
    question: 'Is drafting free?',
    answer: 'Yes. Tokens are only deducted when issuing (Issue / Send / Download final PDF).',
    category: 'pdf',
    top: true,
  },
  {
    id: 'data-storage',
    question: 'Where is my data stored?',
    answer: 'UK/EU cloud; encryption in transit and at rest.',
    category: 'account',
    top: true,
  },
  {
    id: 'reverse-charge',
    question: 'How do I add a reverse charge note?',
    answer: 'Choose "intra-EU 0%" or "UK↔EU cross-border"; note and breakdown appear automatically.',
    category: 'vat',
    top: true,
  },
  {
    id: 'email-invoice',
    question: 'How do I email an invoice?',
    answer: 'From preview: Email/Share. Read receipts on Pro/Business.',
    category: 'pdf',
    top: true,
  },

  // Tokens & Billing
  {
    id: 'balance-history',
    question: 'Where can I see my balance and history?',
    answer: 'Dashboard → Token history (ledger).',
    category: 'tokens',
  },
  {
    id: 'vat-charges',
    question: 'Do you charge VAT on top-ups?',
    answer: 'Yes, based on your country and VAT status. Reverse charge may apply for eligible EU B2B.',
    category: 'tokens',
  },
  {
    id: 'refunds',
    question: 'Refunds?',
    answer: 'Unused tokens within 14 days → refund; used tokens are non-refundable. See Refund Policy.',
    category: 'tokens',
  },

  // Invoicing & VAT
  {
    id: 'invoice-numbering',
    question: 'Can I set invoice numbering?',
    answer: 'Yes: prefix and next number in Company settings.',
    category: 'vat',
  },
  {
    id: 'multi-currency',
    question: 'Multi-currency?',
    answer: 'GBP/EUR with correct number/date formats.',
    category: 'vat',
  },

  // PDF & Sharing
  {
    id: 'logo-upload',
    question: 'Can I upload a logo?',
    answer: 'On Pro/Business → Branding.',
    category: 'pdf',
  },

  // Account & Security
  {
    id: 'card-numbers',
    question: 'Do you keep card numbers?',
    answer: 'No. Payments handled by providers (e.g., Stripe).',
    category: 'account',
  },
  {
    id: 'delete-account',
    question: 'How to delete my account?',
    answer: 'Settings → Delete. We retain records where law requires (e.g., tax).',
    category: 'account',
  },
];

const CATEGORIES = [
  { id: 'tokens', label: 'Tokens & billing', color: 'bg-blue-100 text-blue-800' },
  { id: 'vat', label: 'Invoicing & VAT', color: 'bg-green-100 text-green-800' },
  { id: 'pdf', label: 'PDF & sharing', color: 'bg-purple-100 text-purple-800' },
  { id: 'account', label: 'Account & security', color: 'bg-orange-100 text-orange-800' },
  { id: 'integrations', label: 'Integrations', color: 'bg-pink-100 text-pink-800' },
] as const;

export default function FAQPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [showContactForm, setShowContactForm] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParams.get('q')) {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
        router.replace(`/help/faq?${params.toString()}`, { scroll: false });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  // Filter and search FAQ items
  const filteredFAQs = useMemo(() => {
    let filtered = FAQ_DATA;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const topQuestions = filteredFAQs.filter(item => item.top);
  const categorizedFAQs = filteredFAQs.filter(item => !item.top);

  // Group by category
  const groupedFAQs = useMemo(() => {
    const groups: Record<FAQCategory, FAQItem[]> = {
      tokens: [],
      vat: [],
      pdf: [],
      account: [],
      integrations: [],
    };

    categorizedFAQs.forEach(item => {
      groups[item.category].push(item);
    });

    return groups;
  }, [categorizedFAQs]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleHelpfulVote = (id: string, helpful: boolean) => {
    setHelpfulVotes(prev => new Set([...prev, id]));
    
    // Track analytics event
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'faq_vote_helpful', {
        question_id: id,
        helpful: helpful,
      });
    }

    if (!helpful) {
      setShowContactForm(id);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/help/faq#${id}`;
    navigator.clipboard.writeText(url);
    
    // Track analytics event
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'faq_copy_link', {
        question_id: id,
      });
    }
  };

  const submitContactForm = async (questionId: string) => {
    if (!contactMessage.trim()) return;

    // Track analytics event
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('event', 'faq_open_contact', {
        question_id: questionId,
        has_email: !!contactEmail,
      });
    }

    // Here you would typically send to your support system
    console.log('Contact form submitted:', { questionId, email: contactEmail, message: contactMessage });
    
    setShowContactForm(null);
    setContactEmail('');
    setContactMessage('');
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Frequently asked questions
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Pay-as-you-go tokens; UK & EU VAT-ready
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <Input
              ref={searchInputRef}
              placeholder="Search FAQs (e.g. reverse charge, tokens)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-lg py-3"
            />
            {searchQuery && (
              <p className="mt-2 text-sm text-slate-500">
                Try: 'reverse charge', 'tokens', 'VAT', 'refund'
              </p>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
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

        {/* Top Questions */}
        {topQuestions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Top questions</h2>
            <div className="grid gap-4">
              {topQuestions.map(item => (
                <FAQCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedItems.has(item.id)}
                  onToggle={() => toggleExpanded(item.id)}
                  onCopyLink={() => copyLink(item.id)}
                  onHelpfulVote={(helpful) => handleHelpfulVote(item.id, helpful)}
                  hasVoted={helpfulVotes.has(item.id)}
                  showContactForm={showContactForm === item.id}
                  contactEmail={contactEmail}
                  contactMessage={contactMessage}
                  onContactEmailChange={setContactEmail}
                  onContactMessageChange={setContactMessage}
                  onSubmitContact={() => submitContactForm(item.id)}
                  onCloseContact={() => setShowContactForm(null)}
                  highlightQuery={searchQuery}
                  highlightText={highlightText}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categorized FAQs */}
        {Object.entries(groupedFAQs).map(([categoryId, items]) => {
          if (items.length === 0) return null;
          
          const category = CATEGORIES.find(c => c.id === categoryId);
          if (!category) return null;

          return (
            <div key={categoryId} id={categoryId} className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                  {category.label}
                </span>
              </h2>
              <div className="space-y-4">
                {items.map(item => (
                  <FAQCard
                    key={item.id}
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpanded(item.id)}
                    onCopyLink={() => copyLink(item.id)}
                    onHelpfulVote={(helpful) => handleHelpfulVote(item.id, helpful)}
                    hasVoted={helpfulVotes.has(item.id)}
                    showContactForm={showContactForm === item.id}
                    contactEmail={contactEmail}
                    contactMessage={contactMessage}
                    onContactEmailChange={setContactEmail}
                    onContactMessageChange={setContactMessage}
                    onSubmitContact={() => submitContactForm(item.id)}
                    onCloseContact={() => setShowContactForm(null)}
                    highlightQuery={searchQuery}
                    highlightText={highlightText}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
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

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Still need help?
            </h3>
            <p className="text-slate-600 mb-6">
              Can't find what you're looking for? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/generator" size="lg">
                Open invoice generator
              </Button>
              <Button href="/pricing" size="lg" variant="outline">
                Top up tokens
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FAQCard({
  item,
  isExpanded,
  onToggle,
  onCopyLink,
  onHelpfulVote,
  hasVoted,
  showContactForm,
  contactEmail,
  contactMessage,
  onContactEmailChange,
  onContactMessageChange,
  onSubmitContact,
  onCloseContact,
  highlightQuery,
  highlightText,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyLink: () => void;
  onHelpfulVote: (helpful: boolean) => void;
  hasVoted: boolean;
  showContactForm: boolean;
  contactEmail: string;
  contactMessage: string;
  onContactEmailChange: (email: string) => void;
  onContactMessageChange: (message: string) => void;
  onSubmitContact: () => void;
  onCloseContact: () => void;
  highlightQuery: string;
  highlightText: (text: string, query: string) => React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-6 hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900 pr-4">
            {highlightText(item.question, highlightQuery)}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Copy link"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
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
              <div className="pt-4 text-slate-700 leading-relaxed">
                {highlightText(item.answer, highlightQuery)}
              </div>

              {/* Helpful Vote */}
              {!hasVoted && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-3">Did this help?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onHelpfulVote(true)}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => onHelpfulVote(false)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <AnimatePresence>
                {showContactForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-slate-100"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">Still need help?</h4>
                        <button
                          onClick={onCloseContact}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          type="email"
                          placeholder="Your email (optional)"
                          value={contactEmail}
                          onChange={(e) => onContactEmailChange(e.target.value)}
                        />
                        <textarea
                          placeholder="What can we help you with?"
                          value={contactMessage}
                          onChange={(e) => onContactMessageChange(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={onSubmitContact}
                            disabled={!contactMessage.trim()}
                            size="sm"
                          >
                            Send message
                          </Button>
                          <Button
                            href="/contact"
                            variant="outline"
                            size="sm"
                          >
                            Contact support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}


