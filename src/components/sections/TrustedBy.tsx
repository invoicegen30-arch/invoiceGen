'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Section from '@/components/layout/Section';
import TodoPanel from '@/components/dev/TodoPanel';
import { TRUSTED_BY_TODOS } from '@/lib/todos';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BRANDS } from '@/lib/brands';
import Link from 'next/link';

export default function TrustedBy() {
  const [showTodos, setShowTodos] = useState(process.env.NODE_ENV !== 'production');
  const reduce = useReducedMotion();

  // Deterministic initial order for SSR + first client render
  const featured = BRANDS.filter(b => b.tier === 'featured' && b.consent !== false);
  const restDeterministic = BRANDS.filter(b => b.tier !== 'featured' && b.consent !== false);
  const initialItems = [...featured, ...restDeterministic].slice(0, 12);
  const [items, setItems] = useState(initialItems);

  // Only on client after mount: shuffle non-featured to vary order without hydration mismatch
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('todos') === '1') setShowTodos(true);
    } catch {}

    // Shuffle copy of the non-featured brands on client only
    const rest = BRANDS.filter(b => b.tier !== 'featured' && b.consent !== false).slice();
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    const next = [...featured, ...rest].slice(0, 12);
    setItems(next);
  }, []);
  return (
    <Section className="py-12">
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold">Trusted by</h2>
        <p className="mt-2 text-slate-600">We'll add real brands after launch.</p>
      </motion.div>
      {showTodos && (
        <TodoPanel items={TRUSTED_BY_TODOS} />
      )}

      {/* Desktop grid 2x6 */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {items.map((b, i) => (
          <LogoTile key={b.id} brand={b} index={i} reduce={reduce} priority={i < 6} />
        ))}
        {/* Mini CTA */}
        <motion.div
          className="col-span-3 md:col-span-2 lg:col-span-1 flex items-center justify-center"
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 * items.length }}
          viewport={{ once: true }}
        >
          <Link href="/contact" className="text-sm rounded-xl border border-black/10 px-3 py-2 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-blue-600/30 outline-none">
            Become a customer →
          </Link>
        </motion.div>
      </div>

      {/* Mobile marquee */}
      <div className="sm:hidden overflow-hidden relative mt-2">
        <div className={`flex gap-6 items-center ${reduce ? '' : 'animate-[marquee_14s_linear_infinite]'} hover:[animation-play-state:paused]`}
             aria-label="Trusted by marquee">
          {[...items, ...items].map((b, i) => (
            <LogoMonoColor key={`${b.id}-${i}`} brand={b} height={22} priority={i < 3} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function LogoTile({ brand, index, reduce, priority }: { brand: (typeof BRANDS)[number]; index: number; reduce: boolean | null; priority?: boolean }) {
  return (
    <motion.div
      className="group h-10 flex items-center justify-center rounded-xl border border-black/5 bg-white text-slate-500 hover:text-slate-700 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-600/30"
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 * index }}
      viewport={{ once: true }}
    >
      <LogoMonoColor brand={brand} height={22} priority={priority} />
    </motion.div>
  );
}

function LogoMonoColor({ brand, height = 20, priority }: { brand: (typeof BRANDS)[number]; height?: number; priority?: boolean }) {
  // Default mono via CSS filters; color on hover
  return (
    <Link href={brand.href || '#'} className="inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 rounded-lg" title={`${brand.name} logo`}>
      <span className="relative inline-block" style={{ height }}>
        {/* Mono (filtered) */}
        <Image
          src={brand.monoSrc || brand.colorSrc}
          alt={`${brand.name} logo`}
          title={`${brand.name} logo`}
          width={120}
          height={height}
          className="h-[22px] w-auto object-contain opacity-90 grayscale contrast-100 saturate-0"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        {/* Color overlay shown on hover */}
        <Image
          src={brand.colorSrc}
          alt=""
          aria-hidden="true"
          width={120}
          height={height}
          className="absolute inset-0 h-[22px] w-auto object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          priority={false}
          loading="lazy"
        />
      </span>
    </Link>
  );
}



