'use client';

import InvoiceA4 from '@/components/pdf/InvoiceA4';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LogoUploader from '@/components/ui/LogoUploader';
import Textarea from '@/components/ui/Textarea';
import { CC, CURRENCY_BY_COUNTRY, VAT_RATES } from '@/lib/constants';
import { Item, TaxMode } from '@/types/invoice';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import InvoicePaper from './InvoicePaper';

interface InvoiceFormProps {
  signedIn: boolean;
}

export default function InvoiceForm({ signedIn }: InvoiceFormProps) {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Region/country/currency/tax
  const [region, setRegion] = useState('UK');
  const [country, setCountry] = useState('United Kingdom');
  const [currency, setCurrency] = useState(CURRENCY_BY_COUNTRY['United Kingdom'] || 'GBP');
  const [taxMode, setTaxMode] = useState<TaxMode>('domestic');

  const countryCode = CC[country] || 'UK';
  const countryRates = VAT_RATES[countryCode] || [0, 20];
  const standardRate = countryRates[countryRates.length - 1] || 20;
  const [lineTaxRate, setLineTaxRate] = useState<number>(standardRate);

  // Items
  const [items, setItems] = useState<Item[]>([
    { desc: 'Service #1', qty: 1, rate: 100, tax: standardRate },
    { desc: 'Service #2', qty: 1, rate: 200, tax: standardRate },
  ]);
  // Local input buffers for decimal-friendly rate editing
  const [rateInputs, setRateInputs] = useState<string[]>(["100.00", "200.00"]);

  // Sender / Client / Invoice metadata / Notes (for live preview)
  const [sender, setSender] = useState({
    company: 'Acme Ltd',
    vat: country === 'United Kingdom' ? 'GB123456789' : 'EU VAT',
    address: '221B Baker Street',
    city: 'London',
    country,
    iban: 'GB00BANK0000000000',
    bankName: '',
    bic: '',
  });
  const [client, setClient] = useState({
    name: 'Client GmbH',
    vat: 'DE123456789',
    address: 'Potsdamer Platz 1',
    city: 'Berlin',
    country: 'Germany',
    iban: '',
    bankName: '',
    bic: '',
    email: '',
  });
  const [invoiceMeta, setInvoiceMeta] = useState({
    number: 'INV-2025-000245',
    date: new Date().toISOString().slice(0, 10),
    due: '2025-09-16',
  });
  useEffect(() => {
    // Always keep date as today on generator page
    const today = new Date().toISOString().slice(0, 10);
    setInvoiceMeta((m) => (m.date !== today ? { ...m, date: today } : m));
  }, []);
  const [paymentTerm, setPaymentTerm] = useState<'pre' | 7 | 14 | 30 | 45 | 60>(14);
  const [notes, setNotes] = useState('Add notes and comments');
  const [logo, setLogo] = useState<string | null>(null);

  const gated = !signedIn;
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [busy, setBusy] = useState<'save' | 'share' | 'download' | 'email' | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  const updateAllLineTaxes = (tax: number) => setItems((prev) => prev.map((it) => ({ ...it, tax })));

  const onRegionChange = (r: string) => {
    setRegion(r);
    const nextCountry = r === 'UK' ? 'United Kingdom' : 'Germany';
    const nextCurrency = CURRENCY_BY_COUNTRY[nextCountry] || (r === 'UK' ? 'GBP' : 'EUR');
    const nextCode = CC[nextCountry] || (r === 'UK' ? 'UK' : 'DE');
    const nextRates = VAT_RATES[nextCode] || [0, 20];
    const nextStandard = nextRates[nextRates.length - 1] || 20;
    setCountry(nextCountry);
    setCurrency(nextCurrency);
    setTaxMode(r === 'UK' ? 'domestic' : taxMode);
    const apply = r === 'UK' || taxMode === 'domestic' ? nextStandard : 0;
    setLineTaxRate(apply);
    updateAllLineTaxes(apply);
    setSender((prev) => ({ ...prev, country: nextCountry }));
  };

  const onCountryChange = (c: string) => {
    setCountry(c);
    const nextCurr = CURRENCY_BY_COUNTRY[c] || currency;
    const code = CC[c];
    const rates = code && VAT_RATES[code] ? VAT_RATES[code] : [0, 20];
    const nextStandard = rates[rates.length - 1] || 20;
    setCurrency(nextCurr);
    const apply = taxMode === 'domestic' ? nextStandard : 0;
    setLineTaxRate(apply);
    updateAllLineTaxes(apply);
    setSender((prev) => ({ ...prev, country: c }));
  };

  const addItem = () =>
    setItems((prev) => {
      const next = [
        ...prev,
        { desc: `Service #${prev.length + 1}`, qty: 1, rate: 100, tax: lineTaxRate },
      ];
      setRateInputs((r) => [...r, '100.00']);
      return next;
    });

  const updateItem = (idx: number, key: keyof Item, val: any) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const taxTotal = items.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0) * ((Number(it.tax) || 0) / 100),
    0
  );
  const total = subtotal + taxTotal;

  // Keep buffers aligned with items length (e.g., when prefilled or reset)
  useEffect(() => {
    setRateInputs((prev) => {
      if (prev.length === items.length) return prev;
      return items.map((it) => (Number.isFinite(it.rate) ? (Math.round((it.rate as number) * 100) / 100).toFixed(2) : '0.00'));
    });
  }, [items.length]);

  const zeroNote =
    taxMode === 'intraEU_rc'
      ? 'VAT 0% - Intra-EU supply (reverse charge applies).'
      : taxMode === 'uk_eu_cross'
      ? 'VAT 0% - UK to EU cross-border supply (check zero-rating rules).'
      : taxMode === 'export'
      ? 'VAT 0% - Export outside UK/EU.'
      : undefined;

  // Auto-calc Due when payment term or Date changes
  useEffect(() => {
    try {
      const base = new Date(invoiceMeta.date);
      if (Number.isNaN(base.getTime())) return;
      if (paymentTerm === 'pre') {
        setInvoiceMeta((m) => ({ ...m, due: m.date }));
      } else {
        const days = Number(paymentTerm) || 0;
        const d = new Date(base.getTime());
        d.setDate(base.getDate() + days);
        const dueStr = d.toISOString().slice(0, 10);
        setInvoiceMeta((m) => ({ ...m, due: dueStr }));
      }
    } catch {}
  }, [invoiceMeta.date, paymentTerm]);

  // Initialize from /api/me
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const { user } = await res.json();
        const company = (user as any)?.company as any;
        if (company) {
          const vatOrReg = company.vat || company.reg || '';
          const nextCountry = company.country ?? null;
          setSender((prev) => ({
            ...prev,
            company: company.name ?? prev.company,
            vat: vatOrReg,
            address: company.address1 ?? prev.address,
            city: company.city ?? prev.city,
            country: nextCountry ?? prev.country,
            iban: company.iban ?? prev.iban,
            bankName: company.bankName ?? prev.bankName,
            bic: company.bic ?? prev.bic,
          }));
          if (company.country && CURRENCY_BY_COUNTRY[company.country]) setCountry(company.country);
        }
        if ((user as any)?.currency) setCurrency((user as any).currency);
        if (typeof (user as any)?.tokenBalance === 'number') setTokenBalance((user as any).tokenBalance);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Live sync: BroadcastChannel + focus refresh
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('app-events');
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data: any = (ev as any)?.data || {};
        if (data.type === 'company-updated' && data.company) {
          const c = data.company;
          const vatOrReg = c.vat || c.reg || '';
          setSender((prev) => ({
            ...prev,
            company: c.name ?? prev.company,
            vat: vatOrReg,
            address: c.address1 ?? prev.address,
            city: c.city ?? prev.city,
            country: c.country ?? prev.country,
            iban: c.iban ?? prev.iban,
          }));
          if (c.country && CURRENCY_BY_COUNTRY[c.country]) setCountry(c.country);
        }
        if (data.type === 'tokens-updated' && typeof data.tokenBalance === 'number') {
          setTokenBalance(data.tokenBalance);
        }
      };
    } catch {}
    const onFocus = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const { user } = await res.json();
        if (typeof (user as any)?.tokenBalance === 'number') setTokenBalance((user as any).tokenBalance);
        const company = (user as any)?.company as any;
        if (company) {
          const vatOrReg = company.vat || company.reg || '';
          setSender((prev) => ({
            ...prev,
            company: company.name ?? prev.company,
            vat: vatOrReg,
            address: company.address1 ?? prev.address,
            city: company.city ?? prev.city,
            country: company.country ?? prev.country,
            iban: company.iban ?? prev.iban,
          }));
        }
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    return () => {
      try {
        bcRef.current?.close();
      } catch {}
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Charge tokens helper and broadcast update
  const chargeTokens = async (cost: number) => {
    try {
      const res = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Invoice', delta: -Math.abs(cost) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Failed to charge tokens' }));
        throw new Error(j.error || 'Failed to charge tokens');
      }
      const { tokenBalance: newBalance } = await res.json();
      if (typeof newBalance === 'number') {
        setTokenBalance(newBalance);
        try {
          bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: newBalance });
        } catch {}
      }
      return true;
    } catch (e: any) {
      setBanner({ type: 'error', msg: e.message || 'Token charge failed' });
      return false;
    }
  };

  const downloadPdf = async () => {
    if (!signedIn) return;
    if (tokenBalance !== null && tokenBalance < 10) {
      setBanner({ type: 'error', msg: 'Not enough tokens (10 required).' });
      return;
    }
    setBusy('download');
    setBanner(null);
    try {
      // Sync seller company details first
      try {
        await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: sender.company, vat: sender.vat, address1: sender.address, city: sender.city, country: sender.country, iban: sender.iban, logoUrl: logo || undefined, bankName: sender.bankName, bic: sender.bic }) });
      } catch {}
      
      // Create Ready invoice directly (charges 10 tokens)
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          client: client.name,
          subtotal: Math.round(subtotal),
          tax: Math.round(taxTotal),
          total: Math.round(total),
          due: invoiceMeta.due,
          clientMeta: {
            vat: client.vat,
            address: client.address,
            city: client.city,
            country: client.country,
            email: client.email,
            iban: client.iban,
            bankName: client.bankName,
            bic: client.bic,
          },
          items: items.map((it) => ({
            description: it.desc,
            quantity: it.qty,
            rate: it.rate,
            tax: it.tax,
          })),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const { invoice, tokenBalance } = await res.json();
      if (!invoice || !invoice.id) {
        throw new Error("Could not create invoice for download.");
      }
      
      // Update token balance
      if (typeof tokenBalance === 'number') {
        setTokenBalance(tokenBalance);
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance }); } catch {}
      }
      
      // Update invoice meta
      try {
        setInvoiceMeta((prev) => ({ ...prev, number: String(invoice.number || prev.number), date: new Date(invoice.date).toISOString().slice(0, 10) }));
      } catch {}

      // Generate downloadable PDF from the hidden print area
      const el = document.getElementById('print-area');
      if (!el) throw new Error('Print area not found');
      const prevDisplay = el.style.display;
      const prevPos = (el.style as any).position;
      const prevLeft = (el.style as any).left;
      (el.style as any).display = 'block';
      (el.style as any).position = 'absolute';
      (el.style as any).left = '-10000px';

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el as HTMLElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });

      (el.style as any).display = prevDisplay;
      (el.style as any).position = prevPos;
      (el.style as any).left = prevLeft;

      const imgData = canvas.toDataURL('image/png');
      try {
        const res = await fetch(`/api/pdf/${invoice.id}?due=${encodeURIComponent(invoiceMeta.due || '')}`);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Invoice - ${invoiceMeta.number || 'XXXXXX'}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setBanner({ type: 'success', msg: 'PDF downloaded.' });
        } else {
          throw new Error('Server PDF failed');
        }
      } catch {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
        const fname = `Invoice - ${invoiceMeta.number || 'XXXXXX'}.pdf`;
        pdf.save(fname);
        setBanner({ type: 'success', msg: 'PDF downloaded.' });
      }
    } catch (e: any) {
      if (invoice?.id) {
        try { await fetch(`/api/invoices/${invoice.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Error' }) }); } catch {}
      }
      setBanner({ type: 'error', msg: e.message || 'PDF download failed.' });
    } finally {
      setBusy(null);
    }
  };

  const saveDraft = async () => {
    setBusy('save');
    setBanner(null);
    try {
      await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: sender.company, vat: sender.vat, address1: sender.address, city: sender.city, country: sender.country, iban: sender.iban, logoUrl: logo || undefined, bankName: sender.bankName, bic: sender.bic }) });
    } catch {}
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          client: client.name,
          subtotal: Math.round(subtotal),
          tax: Math.round(taxTotal),
          total: Math.round(total),
          due: invoiceMeta.due,
          clientMeta: { vat: client.vat, address: client.address, city: client.city, country: client.country, email: client.email, iban: client.iban, bankName: client.bankName, bic: client.bic },
          items: items.map((it) => ({ description: it.desc, quantity: it.qty, rate: it.rate, tax: it.tax })),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({ error: 'Failed' }))).error || 'Failed to save draft');
      setBanner({ type: 'success', msg: 'Draft saved to Dashboard.' });
    } catch (e) {
      setBanner({ type: 'error', msg: (e as any).message || 'Failed to save draft.' });
    } finally {
      setBusy(null);
    }
  };


const saveInvoice = async (isDraft: boolean) => {
    try {
      // Sync seller company details
      await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sender.company,
          vat: sender.vat,
          address1: sender.address,
          city: sender.city,
          country: sender.country,
          iban: sender.iban,
          logoUrl: logo || undefined,
          bankName: sender.bankName,
          bic: sender.bic,
        }),
      });
    } catch {}
    try {
      // Save draft or ready invoice
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          client: client.name,
          subtotal: Math.round(subtotal),
          tax: Math.round(taxTotal),
          total: Math.round(total),
          due: invoiceMeta.due,
          clientMeta: {
            vat: client.vat,
            address: client.address,
            city: client.city,
            country: client.country,
            email: client.email,
            iban: client.iban,
            bankName: client.bankName,
            bic: client.bic,
          },
          items: items.map((it) => ({
            description: it.desc,
            quantity: it.qty,
            rate: it.rate,
            tax: it.tax,
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({ error: 'Failed' }))).error || 'Failed to save invoice');
      const { invoice } = await res.json();
      if (!isDraft) {
        // Mark as Ready
        await fetch(`/api/invoices/${invoice.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Ready',
            subtotal: Math.round(subtotal),
            tax: Math.round(taxTotal),
            total: Math.round(total),
          }),
        });
      }
      return invoice;
    } catch (e: any) {
      console.error('Save invoice error:', e);
      throw new Error(e.message || 'Failed to save invoice');
    }
  };

const sendEmail = async () => {
    if (!signedIn) return;
    if (tokenBalance !== null && tokenBalance < 10) {
      setBanner({ type: 'error', msg: 'Not enough tokens (10 required).' });
      return;
    }
    setBusy('email');
    setBanner(null);
    try {
      // 1. Создаем Ready инвойс напрямую через /api/invoices (списывает токены)
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          client: client.name,
          subtotal: Math.round(subtotal),
          tax: Math.round(taxTotal),
          total: Math.round(total),
          due: invoiceMeta.due,
          clientMeta: {
            vat: client.vat,
            address: client.address,
            city: client.city,
            country: client.country,
            email: client.email,
            iban: client.iban,
            bankName: client.bankName,
            bic: client.bic,
          },
          items: items.map((it) => ({
            description: it.desc,
            quantity: it.qty,
            rate: it.rate,
            tax: it.tax,
          })),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const { invoice, tokenBalance } = await res.json();
      if (!invoice || !invoice.id) {
        throw new Error("Could not create invoice for sending.");
      }
      
      // Update token balance
      if (typeof tokenBalance === 'number') {
        setTokenBalance(tokenBalance);
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance }); } catch {}
      }
      
      // Update invoice meta
      try {
        setInvoiceMeta((prev) => ({ ...prev, number: String(invoice.number || prev.number), date: new Date(invoice.date).toISOString().slice(0, 10) }));
      } catch {}
      
      const savedInvoice = invoice;

      // 2. Проверяем email клиента
      if (!client.email) {
        setBanner({ type: 'error', msg: 'Please enter client email address first.' });
        setBusy(null);
        return;
      }
      
      const recipientEmail = client.email;

      // 3. Отправляем на наш API
      setBanner({ type: 'success', msg: 'Sending email...' });
      const emailRes = await fetch(`/api/invoices/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipientEmail, invoiceId: savedInvoice.id }),
      });

      if (!emailRes.ok) {
        const data = await emailRes.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send email.');
      }

      setBanner({ type: 'success', msg: 'Email sent successfully!' });
    } catch (e: any) {
      setBanner({ type: 'error', msg: e.message || 'Failed to queue email.' });
    } finally {
      setBusy(null);
    }
  };
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Region:</span>
          <select value={region} onChange={(e) => onRegionChange(e.target.value)} className="rounded-lg border border-black/10 bg-white px-2.5 py-2">
            <option>UK</option>
            <option>EU</option>
          </select>
          <span className="font-medium ml-3">Country:</span>
          <select value={country} onChange={(e) => onCountryChange(e.target.value)} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 max-w-[220px]">
            {Object.keys(CURRENCY_BY_COUNTRY)
              .sort()
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <span className="font-medium ml-3">Currency:</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-lg border border-black/10 bg-white px-2.5 py-2">
            {Array.from(new Set(Object.values(CURRENCY_BY_COUNTRY)))
              .sort()
              .map((code) => (
                <option key={code}>{code}</option>
              ))}
          </select>
          <span className="font-medium ml-3">Invoice language:</span>
          <span className="px-2 py-1 rounded-lg border border-black/10 bg-white">EN</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={saveDraft} disabled={gated || busy !== null} variant="secondary" size="sm">
            {busy === 'save' ? 'Saving:' : 'Save draft'}
          </Button>
          <Button onClick={downloadPdf} disabled={gated || busy !== null} title={gated ? 'Available after sign-up' : 'Download PDF'} size="sm" className={gated ? 'bg-slate-300' : ''}>
            {busy === 'download' ? 'Processing:' : 'Download PDF'}
          </Button>
          <Button onClick={sendEmail} disabled={gated || busy !== null} title={gated ? 'Available after sign-up' : 'Send via email'} size="sm" className={gated ? 'bg-slate-300' : ''}>
            {busy === 'email' ? 'Processing:' : 'Send email'}
          </Button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`rounded-lg border px-3 py-2 text-sm ${banner.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {banner.msg}
        </div>
      )}

      {/* Tax treatment */}
      <motion.div className="rounded-2xl bg-white p-5 border border-black/10 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="mb-4">
          <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Tax treatment</h3>
          <p className="text-xs text-slate-500 mt-1">Choose how VAT is applied</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="taxmode" checked={taxMode === 'domestic'} onChange={() => { setTaxMode('domestic'); setLineTaxRate(standardRate); updateAllLineTaxes(standardRate); }} />
              <span>Domestic supply (apply local rates)</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="taxmode" checked={taxMode === 'intraEU_rc'} onChange={() => { setTaxMode('intraEU_rc'); setLineTaxRate(0); updateAllLineTaxes(0); }} />
              <span>Intra-EU B2B (reverse charge, 0%)</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="taxmode" checked={taxMode === 'uk_eu_cross'} onChange={() => { setTaxMode('uk_eu_cross'); setLineTaxRate(0); updateAllLineTaxes(0); }} />
              <span>UK to EU cross-border (zero-rated)</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="taxmode" checked={taxMode === 'export'} onChange={() => { setTaxMode('export'); setLineTaxRate(0); updateAllLineTaxes(0); }} />
              <span>Export outside UK/EU (0%)</span>
            </label>
            <div className="text-xs text-slate-500">Note: Exact rates vary by goods/services. Verify before issuing a live invoice.</div>
          </div>
          <div className="grid grid-cols-2 gap-3 content-start">
            <div className="grid gap-1.5 text-xs">
              <label className="text-slate-600">Preset rates for {country}</label>
              <select className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm" value={lineTaxRate} onChange={(e) => { const v = Number(e.target.value); setLineTaxRate(v); updateAllLineTaxes(v); }} disabled={taxMode !== 'domestic'}>
                {(countryRates.length ? countryRates : [0, standardRate]).map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5 text-xs">
              <label className="text-slate-600">Apply to all items</label>
              <button onClick={() => updateAllLineTaxes(lineTaxRate)} className="rounded-lg border border-black/10 px-3 py-2 text-sm w-full">
                Apply
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div>
          <motion.div className="rounded-2xl bg-white p-5 border border-black/10 shadow-sm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Branding</h3>
              <p className="text-xs text-slate-500 mt-1">Upload your logo to appear on the invoice</p>
            </div>
            <div className="mb-4">
              <LogoUploader value={logo} onChange={setLogo} />
            </div>
            {/* Invoice metadata directly under Branding */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Invoice</h3>
              <p className="text-xs text-slate-500 mt-1">Metadata & numbering</p>
            </div>
            <div className="grid sm:grid-cols-4 gap-3 items-end">
              <Input label="Number" value={invoiceMeta.number} onChange={(e) => setInvoiceMeta((m) => ({ ...m, number: e.target.value }))} />
              <Input label="Date" type="date" value={invoiceMeta.date} readOnly />
              <Input label="Due" type="date" value={invoiceMeta.due} onChange={(e) => setInvoiceMeta((m) => ({ ...m, due: e.target.value }))} />
              <div className="grid gap-1.5">
                <label className="text-xs text-slate-600">Payment terms</label>
                <select className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm" value={String(paymentTerm)} onChange={(e)=>{
                  const v = e.target.value === 'pre' ? 'pre' : (Number(e.target.value) as any);
                  setPaymentTerm(v);
                }}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                  <option value="pre">Pre-payment</option>
                </select>
              </div>
            </div>

            <hr className="my-4 border-black/10" />

            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Sender</h3>
              <p className="text-xs text-slate-500 mt-1">Your company details</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Company name" value={sender.company} onChange={(e) => setSender((s) => ({ ...s, company: e.target.value }))} />
              <Input label="VAT / Reg" value={sender.vat} onChange={(e) => setSender((s) => ({ ...s, vat: e.target.value }))} />
              <Input label="Address line" value={sender.address} onChange={(e) => setSender((s) => ({ ...s, address: e.target.value }))} />
              <Input label="City" value={sender.city} onChange={(e) => setSender((s) => ({ ...s, city: e.target.value }))} />
              <Input label="Country" value={country} onChange={(e) => onCountryChange(e.target.value)} />
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-600 font-medium">Bank details (Sender)</div>
              <div className="grid sm:grid-cols-3 gap-3 mt-1.5">
                <Input label="IBAN" value={sender.iban} onChange={(e) => setSender((s) => ({ ...s, iban: e.target.value }))} />
                <Input label="Bank name" value={sender.bankName} onChange={(e) => setSender((s) => ({ ...s, bankName: e.target.value }))} />
                <Input label="SWIFT / BIC" value={sender.bic} onChange={(e) => setSender((s) => ({ ...s, bic: e.target.value }))} />
              </div>
            </div>

            <hr className="my-4 border-black/10" />

            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Client</h3>
              <p className="text-xs text-slate-500 mt-1">Bill-to details</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Client name" value={client.name} onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))} />
              <Input label="Client email" type="email" value={client.email} onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))} />
              <Input label="VAT / Reg" value={client.vat} onChange={(e) => setClient((c) => ({ ...c, vat: e.target.value }))} />
              <Input label="Address line" value={client.address} onChange={(e) => setClient((c) => ({ ...c, address: e.target.value }))} />
              <Input label="City" value={client.city} onChange={(e) => setClient((c) => ({ ...c, city: e.target.value }))} />
              <Input label="Country" value={client.country} onChange={(e) => setClient((c) => ({ ...c, country: e.target.value }))} />
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-600 font-medium">Bank details (Client)</div>
              <div className="grid sm:grid-cols-3 gap-3 mt-1.5">
                <Input label="IBAN" value={client.iban} onChange={(e) => setClient((c) => ({ ...c, iban: e.target.value }))} />
                <Input label="Bank name" value={client.bankName} onChange={(e) => setClient((c) => ({ ...c, bankName: e.target.value }))} />
                <Input label="SWIFT / BIC" value={client.bic} onChange={(e) => setClient((c) => ({ ...c, bic: e.target.value }))} />
              </div>
            </div>

            <hr className="my-4 border-black/10" />

            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Line items</h3>
              <p className="text-xs text-slate-500 mt-1">Use Enter to add a new row</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-600">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Rate ({currency})</div>
                <div className="col-span-2 text-right">Tax %</div>
              </div>
              {items.map((it, i) => (
                <motion.div key={i} className="grid grid-cols-12 gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Input value={it.desc} onChange={(e) => updateItem(i, 'desc', e.target.value)} wrapperClassName="col-span-6 min-w-0" />
                  <Input value={it.qty} onChange={(e) => updateItem(i, 'qty', Number(e.target.value))} wrapperClassName="col-span-2 min-w-0" className="text-right" inputMode="numeric" />
                  <Input
                    value={rateInputs[i] ?? ''}
                    inputMode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]{0,2}$"
                    onChange={(e) => {
                      const raw = e.target.value || '';
                      let s = raw.replace(',', '.').replace(/[^0-9.]/g, '');
                      const first = s.indexOf('.');
                      if (first !== -1) {
                        s = s.slice(0, first + 1) + s.slice(first + 1).replace(/\./g, '');
                        const parts = s.split('.');
                        const dec = parts[1] ?? '';
                        s = parts[0] + '.' + dec.slice(0, 2);
                        if (raw.endsWith('.') && dec.length === 0) s = parts[0] + '.';
                      }
                      setRateInputs((prev) => prev.map((v, idx) => (idx === i ? s : v)));
                      const num = parseFloat(s);
                      updateItem(i, 'rate', Number.isNaN(num) ? 0 : num);
                    }}
                    wrapperClassName="col-span-2 min-w-0"
                    className="text-right"
                  />
                  <Input value={it.tax} onChange={(e) => updateItem(i, 'tax', Number(e.target.value))} wrapperClassName="col-span-2 min-w-0" className="text-right" inputMode="numeric" />
                </motion.div>
              ))}
              <button onClick={addItem} className="rounded-lg border border-dashed border-black/15 py-2 text-sm hover:bg-slate-50 transition-colors">
                + Add item
              </button>
            </div>

            <hr className="my-4 border-black/10" />

            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Notes & terms</h3>
            </div>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment within 14 days. Late fees may apply." />
          </motion.div>
        </div>

        {/* Preview */}
        <div>
          <motion.div className="rounded-2xl bg-white p-5 border border-black/10 shadow-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">Preview</h3>
              <p className="text-xs text-slate-500 mt-1">A4 layout</p>
            </div>
            <InvoicePaper
              currency={currency}
              zeroNote={zeroNote}
              logoUrl={logo || undefined}
              items={items}
              subtotal={subtotal}
              taxTotal={taxTotal}
              total={total}
              sender={sender}
              client={client}
              invoiceNo={invoiceMeta.number}
              invoiceDate={invoiceMeta.date}
              invoiceDue={invoiceMeta.due}
              notes={notes}
            />
            <div className="mt-3 text-[11px] text-slate-500">
              Totals (auto): Subtotal <b>
                {currency} {subtotal.toFixed(2)}
              </b>{' '}
              - Tax <b>
                {currency} {taxTotal.toFixed(2)}
              </b>{' '}
              - Total <b>
                {currency} {total.toFixed(2)}
              </b>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Print-only A4 template (isolated on print) */}
      <InvoiceA4
        currency={currency}
        zeroNote={zeroNote}
        logoUrl={logo || undefined}
        items={items}
        subtotal={subtotal}
        taxTotal={taxTotal}
        total={total}
        sender={{
          company: sender.company,
          vat: sender.vat,
          address: sender.address,
          city: sender.city,
          country: sender.country,
          iban: sender.iban,
          bankName: sender.bankName,
          bic: sender.bic,
        }}
        client={{
          name: client.name,
          vat: client.vat,
          address: client.address,
          city: client.city,
          country: client.country,
        }}
        invoiceNo={invoiceMeta.number}
        invoiceDate={invoiceMeta.date}
        invoiceDue={invoiceMeta.due}
        notes={notes}
      />
    </div>
  );
}


