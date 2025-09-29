'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PolicyTOC from './PolicyTOC';
import PolicyMeta from './PolicyMeta';
import PolicyContent from './PolicyContent';
import Pill from './Pill';
import { Heading, PolicySection, Region } from '@/types/policy';
import ContactForm from '@/components/contact/ContactForm';

interface PolicyPageProps {
  title: string;
  sections: PolicySection[];
  effectiveDate?: string;
  lastUpdated?: string;
  version?: string;
  helpEmail?: string;
  showRegionToggle?: boolean;
}

export default function PolicyPage({
  title,
  sections,
  effectiveDate = '1 Sep 2025',
  lastUpdated = '2 Sep 2025',
  version = 'v1.0.0',
  helpEmail = 'info@invoicerly.co.uk',
  showRegionToggle = true,
}: PolicyPageProps) {
  const [region, setRegion] = useState<Region>('UK');
  const [active, setActive] = useState<string | null>(sections?.[0]?.id ?? null);
  const contentRef = useRef<HTMLDivElement>(null);

  const headings: Heading[] = useMemo(
    () => (sections || []).map((s) => ({ id: s.id, title: s.title })),
    [sections]
  );

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0));
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root: null, rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    const nodes = contentRef.current.querySelectorAll('section[id]');
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  const lawText = region === 'UK' ? 'England & Wales' : 'Your EU Member State (default: Republic of Ireland)';

  const onJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <Section className="py-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <Pill>UK-first</Pill>
            <Pill>EU-ready</Pill>
            <Pill>English only</Pill>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900">{title}</h1>
          <p className="mt-3 text-slate-600 text-lg">This page outlines our {title.toLowerCase()} for the {region} region.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {showRegionToggle && (
              <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
                {(['UK', 'EU'] as Region[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      region === r ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => window.print()}>Print</Button>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-[220px,1fr,260px] gap-6 items-start">
          <div className="hidden lg:block">
            <Card className="p-4" padding="sm">
              <PolicyTOC headings={headings} current={active} onJump={onJump} />
            </Card>
          </div>

          <div>
            <PolicyMeta
              effectiveDate={effectiveDate}
              lastUpdated={lastUpdated}
              version={version}
              lawText={lawText}
            />
            <div className="mt-6" />
            <div ref={contentRef as any}>
              <PolicyContent sections={sections} />
            </div>
          </div>

          <div>
            <Card className="p-6" padding="md">
              <h3 className="text-base font-semibold">Need help?</h3>
              <p className="text-slate-600 text-sm mt-1">
                Email <a className="underline" href={`mailto:${helpEmail}`}>{helpEmail}</a> and we'll get back to you.
              </p>
              <div className="mt-4 h-px bg-black/10" />
              <h4 className="text-sm font-medium mt-4">Change log</h4>
              <ul className="mt-2 text-sm text-slate-700 space-y-2">
                <li>
                  <span className="text-slate-500">02 Sep 2025 - </span>
                  Draft structure updated for UK/EU.
                </li>
                <li>
                  <span className="text-slate-500">01 Sep 2025 - </span>
                  Initial draft created.
                </li>
              </ul>
            </Card>
          </div>
        </div>

      </Section>

      {/* Feedback / Contact */}
      <Section className="py-10">
        <Card className="p-6" padding="md">
          <h2 className="text-xl font-semibold">Have questions or feedback?</h2>
          <p className="text-sm text-slate-600 mt-1">Send us a message — we typically reply within one business day.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Card>
      </Section>
    </main>
  );
}
