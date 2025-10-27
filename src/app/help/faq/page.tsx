'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { type Currency } from '@/lib/currency';

type FAQCategory = 'tokens' | 'vat' | 'pdf' | 'account' | 'integrations';
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  top?: boolean;
};

// Function to generate dynamic FAQ data based on currency
function getFAQData(currency: Currency): FAQItem[] {
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  const currencyAmount = currency === 'GBP' ? '1,00' : currency === 'EUR' ? '1,15' : '1,33';
  
  return [
    // Top Questions
    {
      id: 'pricing',
      question: 'How does pricing work?',
      answer: `Pay-as-you-go. ${currencyAmount} ${currencySymbol} = 100 tokens. Issuing an invoice costs 10 tokens. Tokens never expire.`,
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
      id: 'vat-calculations',
      question: 'How are VAT calculations handled?',
      answer: 'Automatically based on seller/buyer countries and VAT numbers. Supports reverse charge, domestic rates, and exports.',
      category: 'vat',
    },
    {
      id: 'token-packages',
      question: 'What token packages are available?',
      answer: 'Starter (£10/1000 tokens), Pro (£50/5000 tokens), Business (£100/10000 tokens), and Custom amounts.',
      category: 'tokens',
    },
    {
      id: 'pdf-quality',
      question: 'What PDF quality do you generate?',
      answer: 'High-resolution, print-ready PDFs with proper fonts and formatting.',
      category: 'pdf',
    },
    {
      id: 'email-delivery',
      question: 'How does email delivery work?',
      answer: 'We send invoices via our secure email service. Delivery status is tracked and reported.',
      category: 'pdf',
    },
    {
      id: 'account-setup',
      question: 'How do I set up my account?',
      answer: 'Sign up with email, verify, add company details, and start creating invoices immediately.',
      category: 'account',
    },
    {
      id: 'vat-numbers',
      question: 'Do I need a VAT number?',
      answer: 'Only if you are VAT-registered. The system handles both VAT and non-VAT businesses.',
      category: 'vat',
    },
    {
      id: 'invoice-numbering',
      question: 'Can I customize invoice numbering?',
      answer: 'Yes. Set your own prefix and starting number in Settings.',
      category: 'account',
    },
    {
      id: 'data-export',
      question: 'Can I export my data?',
      answer: 'Yes. Export invoices, clients, and reports in CSV/PDF formats.',
      category: 'account',
    },
    {
      id: 'multi-currency',
      question: 'What currencies are supported?',
      answer: 'GBP, EUR. More currencies coming soon.',
      category: 'tokens',
    },
    {
      id: 'payment-integration',
      question: 'Do you integrate with payment processors?',
      answer: 'Yes. Stripe integration available. More processors coming soon.',
      category: 'integrations',
    },
    {
      id: 'api-access',
      question: 'Is there an API?',
      answer: 'API access available for Business plans. Contact us for details.',
      category: 'integrations',
    },
    {
      id: 'team-collaboration',
      question: 'Can multiple people use one account?',
      answer: 'Yes. Team features available for Business plans with role-based access.',
      category: 'account',
    },
    {
      id: 'backup-restore',
      question: 'Is my data backed up?',
      answer: 'Yes. Automatic daily backups with 30-day retention.',
      category: 'account',
    },
    {
      id: 'mobile-access',
      question: 'Can I access from mobile?',
      answer: 'Yes. Responsive web interface works on all devices.',
      category: 'account',
    },
    {
      id: 'support-hours',
      question: 'What are your support hours?',
      answer: 'Email support: Mon-Fri 9AM-6PM GMT. Response within 24 hours.',
      category: 'account',
    },
    {
      id: 'security-compliance',
      question: 'What security measures do you have?',
      answer: 'SOC 2 compliant, GDPR compliant, encryption in transit and at rest, regular security audits.',
      category: 'account',
    },
    {
      id: 'invoice-templates',
      question: 'Can I customize invoice templates?',
      answer: 'Yes. Multiple templates available with logo upload and custom styling.',
      category: 'pdf',
    },
    {
      id: 'client-management',
      question: 'How do I manage clients?',
      answer: 'Add clients manually or import from CSV. Client details are saved for future invoices.',
      category: 'account',
    },
    {
      id: 'recurring-invoices',
      question: 'Do you support recurring invoices?',
      answer: 'Not yet. This feature is planned for future releases.',
      category: 'pdf',
    },
    {
      id: 'invoice-reminders',
      question: 'Can I send payment reminders?',
      answer: 'Yes. Send automated reminders for overdue invoices.',
      category: 'pdf',
    },
    {
      id: 'delete-account',
      question: 'How to delete my account?',
      answer: 'Settings → Delete. We retain records where law requires (e.g., tax).',
      category: 'account',
    },
  ];
}

const CATEGORIES = [
  { id: 'tokens', label: 'Tokens & billing', color: 'bg-blue-100 text-blue-800' },
  { id: 'vat', label: 'VAT & tax', color: 'bg-green-100 text-green-800' },
  { id: 'pdf', label: 'PDF & email', color: 'bg-purple-100 text-purple-800' },
  { id: 'account', label: 'Account & settings', color: 'bg-orange-100 text-orange-800' },
  { id: 'integrations', label: 'Integrations', color: 'bg-pink-100 text-pink-800' },
];

function FAQCard({ 
  item, 
  isExpanded, 
  onToggle, 
  highlightQuery, 
  onHelpful, 
  onNotHelpful, 
  onContact, 
  isHelpful, 
  showContactForm, 
  contactEmail, 
  contactMessage, 
  onEmailChange, 
  onMessageChange, 
  onSubmitContact, 
  onCancelContact 
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  highlightQuery: string;
  onHelpful: () => void;
  onNotHelpful: () => void;
  onContact: () => void;
  isHelpful: boolean | null;
  showContactForm: boolean;
  contactEmail: string;
  contactMessage: string;
  onEmailChange: (email: string) => void;
  onMessageChange: (message: string) => void;
  onSubmitContact: () => void;
  onCancelContact: () => void;
}) {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const onCopyLink = () => {
    const url = `${window.location.origin}/help/faq#${item.id}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

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
            <div
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onCopyLink();
                }
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Copy link"
              role="button"
              tabIndex={0}
              aria-label="Copy link to this FAQ item"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
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
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-200 mt-4">
                <div className="prose prose-sm max-w-none text-slate-600">
                  {highlightText(item.answer, highlightQuery)}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Was this helpful?</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onHelpful();
                        }}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          isHelpful === true 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600 hover:bg-green-50'
                        }`}
                      >
                        👍 Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNotHelpful();
                        }}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          isHelpful === false 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                        }`}
                      >
                        👎 No
                      </button>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onContact();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Contact us
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showContactForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium text-slate-900 mb-3">Send us a message</h4>
                          <div className="space-y-3">
                            <Input
                              type="email"
                              placeholder="Your email"
                              value={contactEmail}
                              onChange={(e) => onEmailChange(e.target.value)}
                            />
                            <textarea
                              className="w-full p-3 border border-slate-300 rounded-lg resize-none"
                              rows={3}
                              placeholder="Your message..."
                              value={contactMessage}
                              onChange={(e) => onMessageChange(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  onSubmitContact();
                                }}
                                disabled={!contactEmail.trim() || !contactMessage.trim()}
                                className="px-4 py-2"
                              >
                                Send
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  onCancelContact();
                                }}
                                className="px-4 py-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </Card>
  );
}

function FAQContent() {
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

  // Currency state - Always start with GBP for SSR (prevents hydration mismatch)
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [mounted, setMounted] = useState(false);

  // Initialize currency from localStorage after mounting
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('currency') as Currency;
      if (saved && (saved === 'GBP' || saved === 'EUR' || saved === 'USD')) {
        setCurrency(saved);
      }
    } catch {}
  }, []);

  // Listen for currency changes from header using BroadcastChannel
  useEffect(() => {
    const bc = new BroadcastChannel('app-events');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'currency-updated' && (event.data.currency === 'GBP' || event.data.currency === 'EUR' || event.data.currency === 'USD')) {
        setCurrency(event.data.currency);
      }
    };

    bc.addEventListener('message', handleMessage);
    
    return () => {
      bc.removeEventListener('message', handleMessage);
      bc.close();
    };
  }, []);

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
  const filteredItems = useMemo(() => {
    const faqData = getFAQData(currency);
    
    return faqData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, currency]);

  const topItems = useMemo(() => {
    const faqData = getFAQData(currency);
    return faqData.filter(item => item.top);
  }, [currency]);

  const handleToggle = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleHelpful = (itemId: string) => {
    setHelpfulVotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleNotHelpful = (itemId: string) => {
    setHelpfulVotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleContact = (itemId: string) => {
    setShowContactForm(prev => prev === itemId ? null : itemId);
  };

  const handleSubmitContact = () => {
    // Here you would typically send the contact form data
    console.log('Contact form submitted:', { contactEmail, contactMessage });
    setShowContactForm(null);
    setContactEmail('');
    setContactMessage('');
  };

  const handleCancelContact = () => {
    setShowContactForm(null);
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Find answers to common questions about our invoice generation service
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as FAQCategory)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-slate-900 text-white'
                  : `${category.color} hover:opacity-80`
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Questions */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Questions</h2>
          <div className="grid gap-4">
            {topItems.map(item => (
              <FAQCard
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => handleToggle(item.id)}
                highlightQuery={searchQuery}
                onHelpful={() => handleHelpful(item.id)}
                onNotHelpful={() => handleNotHelpful(item.id)}
                onContact={() => handleContact(item.id)}
                isHelpful={helpfulVotes.has(item.id) ? true : null}
                showContactForm={showContactForm === item.id}
                contactEmail={contactEmail}
                contactMessage={contactMessage}
                onEmailChange={setContactEmail}
                onMessageChange={setContactMessage}
                onSubmitContact={handleSubmitContact}
                onCancelContact={handleCancelContact}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Questions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {searchQuery ? `Search Results (${filteredItems.length})` : 'All Questions'}
        </h2>
        <div className="grid gap-4">
          {filteredItems.map(item => (
            <FAQCard
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => handleToggle(item.id)}
              highlightQuery={searchQuery}
              onHelpful={() => handleHelpful(item.id)}
              onNotHelpful={() => handleNotHelpful(item.id)}
              onContact={() => handleContact(item.id)}
              isHelpful={helpfulVotes.has(item.id) ? true : null}
              showContactForm={showContactForm === item.id}
              contactEmail={contactEmail}
              contactMessage={contactMessage}
              onEmailChange={setContactEmail}
              onMessageChange={setContactMessage}
              onSubmitContact={handleSubmitContact}
              onCancelContact={handleCancelContact}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No questions found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'No questions in this category'}
            </p>
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 bg-slate-200 rounded mb-8"></div>
          <div className="h-10 bg-slate-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <FAQContent />
    </Suspense>
  );
}