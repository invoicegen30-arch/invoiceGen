'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { TEMPLATES } from '@/lib/data';
import Button from '@/components/ui/Button';
import { PaperPatternBG } from '@/components/graphics/Patterns';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplatePreview from './TemplatePreview';

export default function TemplatesGallery() {
  const reduce = useReducedMotion();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedTpl, setSelectedTpl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const openWaitlist = (id: string) => {
    setSelectedTpl(id);
    setWaitlistOpen(true);
    setSubmitted(null);
  };
  const closeWaitlist = () => setWaitlistOpen(false);
  const submitWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted('Thanks! You are on the waitlist.');
    // Placeholder for analytics/vote
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('vote_waitlist', { template: selectedTpl, email });
    }
  };
  return (
    <Section className="py-10">
      <Card>
        <motion.h2
          className="text-xl font-semibold mb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Templates Gallery (preview)
        </motion.h2>
        <p className="text-sm text-slate-600 mb-4">
          One production template today. More templates soon - vote which we ship next.
        </p>

        {/* TODO list removed after completion */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-700">
          {TEMPLATES.map((tpl, index) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              index={index}
              reduce={reduce}
              onWaitlist={() => openWaitlist(tpl.id)}
            />
          ))}
        </div>

        {/* Waitlist Modal */}
        {waitlistOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={closeWaitlist}
            aria-modal="true"
            role="dialog"
            aria-labelledby="waitlist-title"
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-black/10 p-6 shadow-lg"
              initial={reduce ? {} : { scale: 0.96, opacity: 0 }}
              animate={reduce ? {} : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="waitlist-title" className="text-lg font-semibold">Join waitlist</h3>
              <p className="text-sm text-slate-600 mt-1">Be the first to know when the template is available.</p>
              <form onSubmit={submitWaitlist} className="mt-4 grid gap-3">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-400/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button type="submit">Join</Button>
                  <Button variant="outline" onClick={closeWaitlist} type="button">Cancel</Button>
                </div>
                {submitted && (
                  <div className="text-xs text-emerald-700" role="status" aria-live="polite">{submitted}</div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </Card>
    </Section>
  );
}

function TemplateCard({ tpl, index, reduce, onWaitlist }: { tpl: { id: string; name: string; status: string; badge?: string; cta?: string }, index: number, reduce: boolean | null, onWaitlist: ()=>void }) {
  const [hovered, setHovered] = useState(false);
  const [pageFlip, setPageFlip] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const isReduced = !!reduce;
    if (!hovered || isReduced || tpl.status !== 'available') return;
    const id = setInterval(() => setPageFlip((p) => (p === 0 ? 1 : 0)), 700);
    return () => clearInterval(id);
  }, [hovered, reduce, tpl.status]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (tpl.status === 'available') router.push('/generator');
      else onWaitlist();
    }
  };

  return (
    <motion.div
      key={tpl.id}
      className="group relative rounded-xl border border-black/10 p-4 bg-gradient-to-br from-slate-50 to-white hover:shadow-sm cursor-pointer focus-within:ring-2 focus-within:ring-blue-600/30 focus-visible:ring-2 focus-visible:ring-blue-600/30 outline-none"
      initial={!!reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20, filter: 'blur(4px)' }}
      whileInView={!!reduce ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      viewport={{ once: true }}
      whileHover={!!reduce ? undefined : { y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`${tpl.name} — ${tpl.status === 'available' ? 'Available now' : 'Preview only'}. ${tpl.status === 'available' ? 'Use this template' : 'Join waitlist'}.`}
      onKeyDown={onKeyDown}
    >
      {/* Template Preview */}
      <div className="relative h-28 rounded-lg bg-slate-100 border border-black/5 mb-3 overflow-hidden flex items-center justify-center">
        <PaperPatternBG className="text-slate-900" />
        {/* Shimmer stripe */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hidden group-hover:block absolute -inset-y-10 -left-1/2 h-40 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
        </div>
        {/* Real template preview */}
        <div className="absolute inset-2 z-10">
          <TemplatePreview 
            template={tpl.name as 'Freelance' | 'Construction' | 'IT Services' | 'Consulting'} 
            className="h-full"
          />
        </div>
        {/* Mini page flip animation for available template */}
        {tpl.status === 'available' && (
          <div className="absolute inset-2 grid grid-cols-2 gap-1 pointer-events-none">
            <motion.div
              key={pageFlip}
              className="col-span-1 rounded bg-white/20 border border-white/30"
              initial={!!reduce ? {} : { opacity: 0.3, x: -2 }}
              animate={!!reduce ? {} : { opacity: 0.6, x: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              key={`p${pageFlip}`}
              className="col-span-1 rounded bg-white/20 border border-white/30"
              initial={!!reduce ? {} : { opacity: 0.3, x: 2 }}
              animate={!!reduce ? {} : { opacity: 0.6, x: 0 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </div>

      {/* Badge in corner - positioned over template preview */}
      {tpl.badge && (
        <span className="absolute top-2 right-2 text-[10px] rounded-full px-2 py-1 bg-slate-900 text-white z-20">
          {tpl.badge}
        </span>
      )}
      <div className="font-medium">{tpl.name}</div>
      <div className="text-xs text-slate-500">{tpl.status === 'available' ? 'Available now' : 'Preview only'}</div>

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        {tpl.status === 'available' ? (
          <Button href="/generator" size="sm">Use this template</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onWaitlist}>Join waitlist</Button>
        )}
      </div>
    </motion.div>
  );
}



