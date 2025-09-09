'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { THEME } from '@/lib/theme';
import Segmented from '@/components/ui/Segmented';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated';
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const isHome = pathname === '/';
  const isGenerator = pathname === '/generator';
  const isPricing = pathname === '/pricing';
  const isTokenCalc = pathname === '/token-calculator';
  const isAbout = pathname === '/about';
  const isDashboard = pathname === '/dashboard';
  const [currency, setCurrency] = useState<'GBP' | 'EUR'>(() => {
    if (typeof window === 'undefined') return 'GBP';
    try { return (localStorage.getItem('currency') as 'GBP'|'EUR') || 'GBP'; } catch { return 'GBP'; }
  });
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const t = (session?.user as any)?.tokenBalance;
    if (typeof t === 'number') setTokens(t);
  }, [session]);

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'tokens-updated' && typeof data.tokenBalance === 'number') {
          setTokens(data.tokenBalance);
        }
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const onCurrencyChange = (next: 'GBP'|'EUR') => {
    setCurrency(next);
    try { localStorage.setItem('currency', next); } catch {}
    try { bcRef.current?.postMessage({ type: 'currency-updated', currency: next }); } catch {}
  };

  const closeHelp = () => setHelpOpen(false);
  const toggleHelp = () => setHelpOpen((v)=>!v);
  const onKeyDownHelp: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Escape') setHelpOpen(false);
  };

  return (
    <motion.header 
      className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-black/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className={`flex items-center gap-2 font-semibold ${THEME.text}`}>
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="flex items-center gap-2"
            >
              <div className={`h-7 w-7 rounded-xl ${THEME.primary.bg}`}></div>
              <span>Invoicerly</span>
            </motion.span>
          </Link>
          
          <nav className="hidden sm:flex items-center gap-2 text-sm relative">
            <a href="/generator" className={`rounded-xl px-3 py-2 transition-colors ${isGenerator ? 'bg-black/5' : 'hover:bg-black/5'}`}>Invoice Generator</a>
            {signedIn && (
              <a href="/dashboard" className={`rounded-xl px-3 py-2 transition-colors ${isDashboard ? 'bg-black/5' : 'hover:bg-black/5'}`}>Dashboard</a>
            )}
            <a href="/pricing" className={`rounded-xl px-3 py-2 transition-colors ${isPricing ? 'bg-black/5' : 'hover:bg-black/5'}`}>Top-Up</a>
            <a href="/token-calculator" className={`rounded-xl px-3 py-2 transition-colors ${isTokenCalc ? 'bg-black/5' : 'hover:bg-black/5'}`}>Token Calculator</a>
            <div className="relative">
              <button
                className={`rounded-xl px-3 py-2 transition-colors flex items-center gap-2 ${helpOpen ? 'bg-black/5' : 'hover:bg-black/5'}`}
                aria-haspopup="menu"
                aria-expanded={helpOpen}
                onClick={toggleHelp}
                onKeyDown={onKeyDownHelp}
              >
                <span>Help</span>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-label="Status ok" />
              </button>
              {helpOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-black/10 bg-white shadow-lg z-50" role="menu" onMouseLeave={closeHelp}>
                  <a href="/help/faq" className="block px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">FAQ</a>
                  <a href="/help/getting-started" className="block px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">Getting Started</a>
                  <a href="/help/billing-tokens" className="block px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">Billing & Tokens</a>
                  <a href="/help/troubleshooting" className="block px-3 py-2 text-sm hover:bg-slate-50" role="menuitem">Troubleshooting</a>
                </div>
              )}
            </div>
            <a href="/about" className={`rounded-xl px-3 py-2 transition-colors ${isAbout ? 'bg-black/5' : 'hover:bg-black/5'}`}>About</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Segmented
              options={[{ label: 'GBP', value: 'GBP' }, { label: 'EUR', value: 'EUR' }]}
              value={currency}
              onChange={(v)=>onCurrencyChange(v as 'GBP'|'EUR')}
            />
          </div>
          {!signedIn ? (
            <>
              <Link
                href="/auth/signin?mode=login"
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/signin?mode=signup"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm transition-colors"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm text-slate-700">
                Tokens: {typeof tokens === 'number' ? tokens : ((session?.user as any)?.tokenBalance ?? 0)}
              </div>
              <Link href="/pricing" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm transition-colors">Top-Up</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </section>
    </motion.header>
  );
}
