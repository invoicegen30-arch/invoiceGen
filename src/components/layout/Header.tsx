'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
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
  const [currency, setCurrency] = useState<'GBP' | 'EUR' | 'AUD'>(() => {
    if (typeof window === 'undefined') return 'GBP';
    try { return (localStorage.getItem('currency') as 'GBP'|'EUR'|'AUD') || 'GBP'; } catch { return 'GBP'; }
  });
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
        if (data.type === 'currency-updated' && (data.currency === 'GBP' || data.currency === 'EUR' || data.currency === 'AUD')) {
          setCurrency(data.currency);
          try { localStorage.setItem('currency', data.currency); } catch {}
        }
      };
    } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  useEffect(() => { setMounted(true); }, []);

  const onCurrencyChange = (next: 'GBP'|'EUR'|'AUD') => {
    setCurrency(next);
    try { localStorage.setItem('currency', next); } catch {}
    try { bcRef.current?.postMessage({ type: 'currency-updated', currency: next }); } catch {}
  };

  const closeHelp = () => setHelpOpen(false);
  const toggleHelp = () => setHelpOpen((v)=>!v);
  const onKeyDownHelp: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Escape') setHelpOpen(false);
  };

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((v)=>!v);
  const toggleMobileHelp = () => setMobileHelpOpen((v)=>!v);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setMobileHelpOpen(false); }, [pathname]);

  // ESC to close mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobile(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!mounted) return;
    try {
      if (mobileOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } catch {}
    return () => { try { document.body.style.overflow = ''; } catch {} };
  }, [mobileOpen, mounted]);

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
        
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden md:block">
            <Segmented
              options={[{ label: 'GBP', value: 'GBP' }, { label: 'EUR', value: 'EUR' }, { label: 'AUD', value: 'AUD' }]}
              value={currency}
              onChange={(v)=>onCurrencyChange(v as 'GBP'|'EUR'|'AUD')}
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

        {/* Burger button (mobile only) */}
        <div className="sm:hidden">
          <button
            aria-label="Open menu"
            className="rounded-xl border border-black/10 bg-white p-2 text-slate-700 hover:bg-slate-50"
            onClick={toggleMobile}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </section>

      {/* Mobile menu overlay (portal to body to avoid stacking/transform issues) */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[100] bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobile}
              />
              <motion.aside
                className="fixed right-0 top-0 z-[101] h-full w-80 max-w-[90%] bg-white border-l border-black/10 shadow-xl flex flex-col"
                role="dialog"
                aria-modal="true"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                  <div className="text-sm font-semibold">Menu</div>
                  <button aria-label="Close menu" onClick={closeMobile} className="rounded-xl p-2 hover:bg-slate-50">
                    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
                  <nav className="grid gap-1">
                    <Link href="/generator" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isGenerator ? 'bg-black/5' : ''}`} onClick={closeMobile}>Invoice Generator</Link>
                    {signedIn && (
                      <Link href="/dashboard" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isDashboard ? 'bg-black/5' : ''}`} onClick={closeMobile}>Dashboard</Link>
                    )}
                    <Link href="/pricing" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isPricing ? 'bg-black/5' : ''}`} onClick={closeMobile}>Top-Up</Link>
                    <Link href="/token-calculator" className={`rounded-xl px-3 py-2 hover:bg-slate-50 ${isTokenCalc ? 'bg-black/5' : ''}`} onClick={closeMobile}>Token Calculator</Link>

                    <button
                      className={`mt-1 rounded-xl px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${mobileHelpOpen ? 'bg-black/5' : ''}`}
                      onClick={toggleMobileHelp}
                      aria-expanded={mobileHelpOpen}
                      aria-controls="mobile-help-group"
                    >
                      <span>Help</span>
                      <svg className={`h-4 w-4 transition-transform ${mobileHelpOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileHelpOpen && (
                        <motion.div
                          id="mobile-help-group"
                          className="ml-2 grid gap-1"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <Link href="/help/faq" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>FAQ</Link>
                          <Link href="/help/getting-started" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>Getting Started</Link>
                          <Link href="/help/billing-tokens" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>Billing & Tokens</Link>
                          <Link href="/help/troubleshooting" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={closeMobile}>Troubleshooting</Link>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Link href="/about" className={`mt-1 rounded-xl px-3 py-2 hover:bg-slate-50 ${isAbout ? 'bg-black/5' : ''}`} onClick={closeMobile}>About</Link>
                  </nav>

                  <div className="mt-4">
                    <div className="mb-2 text-xs text-slate-500">Currency</div>
                    <Segmented
                      options={[{ label: 'GBP', value: 'GBP' }, { label: 'EUR', value: 'EUR' }, { label: 'AUD', value: 'AUD' }]}
                      value={currency}
                      onChange={(v)=>onCurrencyChange(v as 'GBP'|'EUR'|'AUD')}
                    />
                  </div>

                  <div className="mt-4 grid gap-2">
                    {!signedIn ? (
                      <>
                        <Link href="/auth/signin?mode=login" className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>Log in</Link>
                        <Link href="/auth/signin?mode=signup" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>Sign up</Link>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700">
                          Tokens: {typeof tokens === 'number' ? tokens : ((session?.user as any)?.tokenBalance ?? 0)}
                        </div>
                        <Link href="/pricing" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm text-center" onClick={closeMobile}>Top-Up</Link>
                        <button
                          onClick={() => { closeMobile(); signOut({ callbackUrl: '/' }); }}
                          className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-sm"
                        >
                          Sign out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.header>
  );
}
