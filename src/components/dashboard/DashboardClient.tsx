'use client';

import { Button, Card, Input } from '@/components';
import Section from '@/components/layout/Section';
import InvoiceA4 from '@/components/pdf/InvoiceA4';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ТИПЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
type Currency = 'GBP' | 'EUR' | 'USD';
type InvoiceStatus = 'Draft' | 'Ready' | 'Error' | 'Sent' | 'Paid' | 'Overdue';
type Invoice = { id: string; number: string; date: string; client: string; currency: Currency; subtotal: number; tax: number; total: number; status: InvoiceStatus };
type LedgerRow = { id: string; ts: string; type: 'Top-up' | 'Invoice' | 'Adjust' | 'STRIPE_PURCHASE'; delta: number; balanceAfter: number; currency?: Currency; amount?: number; receiptUrl?: string; invoiceNumber?: string };
type Company = { name: string; vat?: string; reg?: string; address1?: string; city?: string; country?: string; iban?: string; bankName?: string; bic?: string };
type Me = { id: string; name: string | null; email: string | null; tokenBalance: number; currency: Currency; company: Company | null };

const currencySym = (c: Currency) => (c === 'GBP' ? 'GBP ' : c === 'EUR' ? 'EUR ' : 'USD ');
const fmtMoney = (n: number, c: Currency) => {
  const sym = currencySym(c);
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try { return `${n < 0 ? '-' : ''}${sym}${new Intl.NumberFormat(undefined, opts).format(abs)}`; } catch { return `${sym}${abs.toFixed(2)}`; }
};

function money(n: number, c: Currency) {
  const sym = c === 'GBP' ? '£' : c === 'EUR' ? '€' : '$';
  const abs = Math.abs(n);
  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try { return `${n < 0 ? '-' : ''}${sym}${new Intl.NumberFormat(undefined, opts).format(abs)}`; } catch { return `${sym}${abs.toFixed(2)}`; }
}
function int(n: number) { try { return new Intl.NumberFormat().format(Math.round(n)); } catch { return String(Math.round(n)); } }


// ====================================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ====================================================================

export default function DashboardClient() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [invRange, setInvSlice] = useState<[number, number]>([0, 20]);
  const [ledRange, setLedSlice] = useState<[number, number]>([0, 20]);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [form, setForm] = useState<Company>({ name: '' });
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewInv, setViewInv] = useState<any | null>(null);
  const [printing, setPrinting] = useState<any>(null);

  // load data
  useEffect(() => {
    try { bcRef.current = new BroadcastChannel('app-events'); } catch {}
    const cleanup = () => { try { bcRef.current?.close(); } catch {} };
    const loadAll = async () => {
      const meRes = await fetch('/api/me');
      if (meRes.ok) {
        const { user } = await meRes.json();
        setMe(user);
        setForm(user.company || { name: '' });
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: user.tokenBalance }); } catch {}
      }
      const invRes = await fetch('/api/invoices');
      if (invRes.ok) {
        const { invoices } = await invRes.json();
        setInvoices(invoices);
      }
      const ledRes = await fetch('/api/ledger');
      if (ledRes.ok) {
        const { ledger } = await ledRes.json();
        setLedger(ledger);
      }
    };
    loadAll();
    const onFocus = () => { loadAll(); };
    try { window.addEventListener('focus', onFocus); } catch {}
    return () => {
      try { window.removeEventListener('focus', onFocus); } catch {}
      cleanup();
    };
  }, []);

  const fetchInvoice = async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`);
    if (!res.ok) return null;
    const { invoice } = await res.json();
    return invoice as any;
  };

  const openView = async (id: string) => {
    if (viewId === id) {
      setViewId(null);
      setViewInv(null);
      return;
    }
    const inv = await fetchInvoice(id);
    if (!inv) { alert('Invoice not found'); return; }
    setViewId(id);
    setViewInv(inv);
  };

  const markReadyIfDraft = async (id: string) => {
    const inv = invoices.find(x => x.id === id);
    if (!inv) return { ok: false, err: 'Not found' };
    if (inv.status !== 'Draft') return { ok: true };
    const res = await fetch(`/api/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Ready', subtotal: inv.subtotal, tax: inv.tax, total: inv.total }) });
    if (!res.ok) {
      const j = await res.json().catch(()=>({ error:'Failed'}));
      return { ok: false, err: j.error || 'Failed to mark Ready' };
    }
    const j = await res.json();
    const updated = j.invoice as Invoice;
    setInvoices(prev => prev.map(x => x.id===id? { ...x, status: updated.status } : x));
    if (typeof j.tokenBalance === 'number' && me) {
      setMe({ ...me, tokenBalance: j.tokenBalance });
      try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: j.tokenBalance }); } catch {}
    }
    const ledRes = await fetch('/api/ledger');
    if (ledRes.ok) { const { ledger } = await ledRes.json(); setLedger(ledger); }
    return { ok: true };
  };

  const ensureReadyAndDownload = async (id: string) => {
    const invFull = await fetchInvoice(id);
    if (!invFull) { alert('Invoice not found'); return; }
    const mark = await markReadyIfDraft(id);
    if (!mark.ok) { alert(mark.err || 'Failed'); return; }
    try {
      const res = await fetch(`/api/pdf/${id}`);
      if (!res.ok) throw new Error('Server PDF failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice - ${invFull.number}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download PDF');
    }
  };

  const createInvoice = async () => {
    if (!me) return;
    if (me.tokenBalance < 10) { alert('Not enough tokens. Top up to create a new invoice.'); return; }
    const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: me.currency, client: 'New Client', subtotal: 100, tax: 20, total: 120 }) });
    if (res.ok) {
      const { invoice, tokenBalance } = await res.json();
      setInvoices(prev => [ { ...invoice, date: new Date(invoice.date).toISOString().slice(0,10) }, ...prev ]);
      setMe({ ...me, tokenBalance });
      try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance }); } catch {}
      const ledRes = await fetch('/api/ledger');
      if (ledRes.ok) {
        const { ledger } = await ledRes.json();
        setLedger(ledger);
      }
    } else {
      const j = await res.json().catch(()=>({ error:'Error'}));
      alert(j.error || 'Error creating invoice');
    }
  };

  const topUp = async (amount: number) => {
    if (!me) return;
    const res = await fetch('/api/ledger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'Top-up', amount, currency: me.currency }) });
    if (res.ok) {
      const { tokenBalance } = await res.json();
      setMe({ ...me, tokenBalance });
      try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance }); } catch {}
      const ledRes = await fetch('/api/ledger');
      if (ledRes.ok) {
        const { ledger } = await ledRes.json();
        setLedger(ledger);
      }
    } else {
      alert('Top-up failed');
    }
  };

  const saveCompanyProfile = async (next: Company) => {
    setSavingCompany(true);
    const res = await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    if (res.ok) {
      const { company } = await res.json();
      setForm(company);
      setSavingCompany(false);
      setErrorBanner(null);
      setSavedBanner('Company profile saved. New invoices will use these details as the seller.');
      try { bcRef.current?.postMessage({ type: 'company-updated', company }); } catch {}
      setTimeout(() => setSavedBanner(null), 2500);
    } else {
      setSavingCompany(false);
      let message = 'Failed to save company';
      try {
        const j = await res.json();
        if (j?.error) message = j.error;
      } catch {}
      setSavedBanner(null);
      setErrorBanner(message);
      setTimeout(() => setErrorBanner(null), 3500);
    }
  };

  const userName = me?.name || 'User';
  const currency = (me?.currency || 'GBP') as Currency;
  const tokenBalance = me?.tokenBalance ?? 0;
  const invView = invoices.slice(invRange[0], invRange[1]);
  const ledgerView = ledger.slice(ledRange[0], ledRange[1]);

  const onInvoiceSlice = useCallback((from: number, to: number) => {
    setInvSlice([from, to]);
  }, []);

  const onLedgerSlice = useCallback((from: number, to: number) => {
    setLedSlice([from, to]);
  }, []);

  return (
    <>
    <main className="bg-slate-50 min-h-screen">
      <style>{`.reveal-in{opacity:1;transform:translateY(0);filter:blur(0)}[data-reveal]{opacity:0;transform:translateY(6px);filter:blur(4px);transition:all .45s ease}`}</style>
      <Section className="py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hello, {userName}</h1>
            <p className="mt-1 text-slate-600">Manage your invoices, token balance, and company details.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-sm rounded-full border border-black/10 bg-white px-3 py-1">Balance: <b>{int(tokenBalance)}</b> tokens <span className="text-slate-500">(~{int(tokenBalance/10)} invoices)</span></div>
            <a href="#company-settings" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm">Company settings</a>
          </div>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-4 items-start">
          <Card padding="sm" data-reveal>
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">Recent invoices</div>
                <a className="text-sm underline" href="#">View all</a>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2">Number</th>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-left px-3 py-2">Client</th>
                      <th className="text-right px-3 py-2">Total</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-right px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invView.map(inv => (
                      <React.Fragment key={inv.id}>
                        <tr className={`border-t ${viewId===inv.id ? 'border-black' : 'border-black/10'}`}>
                          <td className={`px-3 py-2 font-mono text-[12px] ${viewId===inv.id ? 'border-t-2 border-l-2 border-black rounded-tl-xl' : ''}`}>{inv.number}</td>
                          <td className={`px-3 py-2 ${viewId===inv.id ? 'border-t-2 border-black' : ''}`}>{new Date(inv.date).toISOString().slice(0,10)}</td>
                          <td className={`px-3 py-2 ${viewId===inv.id ? 'border-t-2 border-black' : ''}`}>{inv.client}</td>
                          <td className={`px-3 py-2 text-right ${viewId===inv.id ? 'border-t-2 border-black' : ''}`}>{fmtMoney(inv.total, inv.currency)}</td>
                          <td className={`px-3 py-2 ${viewId===inv.id ? 'border-t-2 border-black' : ''}`}>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] border ${
                              inv.status==='Ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                              inv.status==='Error' ? 'border-rose-200 bg-rose-50 text-rose-800' :
                              inv.status==='Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                              inv.status==='Sent' ? 'border-blue-200 bg-blue-50 text-blue-800' :
                              inv.status==='Overdue' ? 'border-rose-200 bg-rose-50 text-rose-800' :
                              'border-black/10'
                            }`}>{inv.status}</span>
                          </td>
                          <td className={`px-3 py-2 text-right ${viewId===inv.id ? 'border-t-2 border-r-2 border-black rounded-tr-xl' : ''}`}>
                            <button className="text-sm underline mr-2" onClick={()=>openView(inv.id)}>{viewId===inv.id? 'Hide' : 'View'}</button>
                            <button className="text-sm underline" onClick={()=>ensureReadyAndDownload(inv.id)}>Download</button>
                          </td>
                        </tr>
                        {viewId===inv.id && viewInv && (
                          <tr className={`bg-white ${viewId===inv.id ? '' : 'border-t border-black/10'}`}>
                            <td className={`px-3 py-3 ${viewId===inv.id ? 'border-l-2 border-r-2 border-b-2 border-black rounded-b-xl' : ''}`} colSpan={6}>
                              <div className="p-2">
                                <ModalInvoiceView
                                  invoice={viewInv}
                                  onClose={()=>{ setViewId(null); setViewInv(null); }}
                                  onRefresh={async(id)=>{ const iv = await fetchInvoice(id); if(iv) setViewInv(iv); }}
                                  onDownload={()=>ensureReadyAndDownload(viewInv.id)}
                                  onSendEmail={async()=>{ const r = await markReadyIfDraft(viewInv.id); if(r.ok){ alert('Email queued'); } else { alert(r.err||'Failed'); }}}
                                  onSave={async(next)=>{
                                    const res = await fetch(`/api/invoices/${viewInv.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
                                    if (res.ok) { const j = await res.json(); setViewInv(j.invoice); setInvoices(prev=>prev.map(x=>x.id===j.invoice.id? { ...x, client: j.invoice.client, subtotal: j.invoice.subtotal, tax: j.invoice.tax, total: j.invoice.total } : x)); }
                                    else { const j = await res.json().catch(()=>({error:'Failed'})); alert(j.error||'Failed to save'); }
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                 </table>
                 <InvoicePager total={invoices.length} pageSize={20} onSlice={onInvoiceSlice} />
              </div>
          </Card>

          <Card padding="sm" data-reveal>
              <div className="text-base font-semibold">Token history</div>
              <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-left px-3 py-2">Type</th>
                      <th className="text-left px-3 py-2">Number</th>
                      <th className="text-right px-3 py-2">Delta</th>
                      <th className="text-right px-3 py-2">Balance</th>
                      <th className="text-right px-3 py-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerView.map(row => (
                      <tr key={row.id} className="border-t border-black/10">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(row.ts).toLocaleString()}</td>
                        <td className="px-3 py-2">{row.type}</td>
                        <td className="px-3 py-2">{row.invoiceNumber || '-'}</td>
                        <td className={`px-3 py-2 text-right ${row.delta>0?'text-emerald-700':'text-slate-900'}`}>{row.delta>0? `+${int(row.delta)}` : `-${int(Math.abs(row.delta))}`} tokens</td>
                        <td className="px-3 py-2 text-right">{int(row.balanceAfter)}</td>
                        <td className="px-3 py-2 text-right">{row.type==='Top-up' || row.type === 'STRIPE_PURCHASE' ? <a className="underline text-sm" href={row.receiptUrl||'#'} target="_blank" rel="noopener noreferrer">Receipt</a> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
                 <LedgerPager total={ledger.length} pageSize={20} onSlice={onLedgerSlice} />
              </div>
          </Card>
        </div>

        <div className="mt-6 scroll-mt-24" id="company-settings">
            <Card padding="sm">
              <div className="text-base font-semibold">Company settings</div>
              <p className="text-sm text-slate-600 mt-1">Saved details will be used as the seller on your invoices.</p>
              {savedBanner && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm p-3">{savedBanner}</div>}
              {errorBanner && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-sm p-3">{errorBanner}</div>}
              <form className="mt-4 grid gap-3" onSubmit={(e)=>{e.preventDefault(); saveCompanyProfile(form);}}>
                <Input label="Company name" value={form.name||''} onChange={(e)=>setForm({...form, name:e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="VAT" value={form.vat||''} onChange={(e)=>setForm({...form, vat:e.target.value})} placeholder="GB123456789" />
                  <Input label="Reg" value={form.reg||''} onChange={(e)=>setForm({...form, reg:e.target.value})} />
                </div>
                <Input label="Address line" value={form.address1||''} onChange={(e)=>setForm({...form, address1:e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={form.city||''} onChange={(e)=>setForm({...form, city:e.target.value})} />
                  <Input label="Country" value={form.country||''} onChange={(e)=>setForm({...form, country:e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="IBAN" value={form.iban||''} onChange={(e)=>setForm({...form, iban:e.target.value})} placeholder={currency==='GBP'? 'GB00 BANK 0000 0000 0000 00' : 'DE00 BANK 0000 0000 0000 00'} />
                  <Input label="Bank name" value={(form as any).bankName||''} onChange={(e)=>setForm({...form, bankName:e.target.value} as any)} placeholder="Your Bank" />
                  <Input label="SWIFT / BIC" value={form.bic||''} onChange={(e)=>setForm({...form, bic:e.target.value})} placeholder="BANKGB2L" />
                </div>
                <div className="mt-2">
                  <Button disabled={savingCompany} variant="primary" type="submit">{savingCompany? 'Saving…' : 'Save company'}</Button>
                </div>
              </form>
            </Card>
        </div>
      </Section>
    </main>
    {printing && (
      <div id="dash-print-area" style={{ position:'absolute', left: '-10000px', top: 0, width: '100%' }}>
        <InvoiceA4
          currency={printing.currency}
          items={printing.items as any}
          subtotal={printing.subtotal}
          taxTotal={printing.tax}
          total={printing.total}
          sender={printing.sender}
          client={printing.client}
          invoiceNo={printing.invoiceNo}
          invoiceDate={printing.invoiceDate}
          invoiceDue={printing.invoiceDue}
          notes={printing.notes}
        />
      </div>
    )}
    {viewId && viewInv && (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30" onClick={()=>{ setViewId(null); setViewInv(null); }} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full overflow-hidden">
            <ModalInvoiceView
              invoice={viewInv}
              onClose={() => { setViewId(null); setViewInv(null); }}
              onRefresh={async(id)=>{ const inv = await fetchInvoice(id); if(inv) setViewInv(inv); }}
              onDownload={()=>ensureReadyAndDownload(viewInv.id)}
              onSendEmail={async () => {
                const clientEmail = (viewInv.clientMeta?.email as string) || '';
                
                if (!clientEmail) {
                  alert('Please add client email address first in the Edit mode.');
                  return;
                }

                const recipientEmail = prompt("Please enter the recipient's email address:", clientEmail);
                if (!recipientEmail) return;

                const r = await markReadyIfDraft(viewInv.id);
                if (r.ok) {
                  try {
                    const res = await fetch(`/api/invoices/send`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: recipientEmail, invoiceId: viewInv.id }),
                    });
                    if (!res.ok) throw new Error('Failed to send email.');
                    alert('Email sent successfully!');
                  } catch (error) {
                    console.error('Email send error:', error);
                    alert('Error sending email. Please try again.');
                  }
                } else {
                  alert(r.err || 'Failed to prepare invoice for sending.');
                }
              }}
              onSave={async(next)=>{
                const res = await fetch(`/api/invoices/${viewInv.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
                if (res.ok) { const j = await res.json(); setViewInv(j.invoice); setInvoices(prev=>prev.map(x=>x.id===j.invoice.id? { ...x, client: j.invoice.client, subtotal: j.invoice.subtotal, tax: j.invoice.tax, total: j.invoice.total } : x)); }
                else { const j = await res.json().catch(()=>({error:'Failed'})); alert(j.error||'Failed to save'); }
              }}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
}


// === ВЫНЕСЕННЫЕ КОМПОНЕНТЫ ===

function TablePager({ total, pageSize = 20, onSlice }: { total: number; pageSize?: number; onSlice: (from: number, to: number) => void }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const from = Math.min((page - 1) * pageSize, Math.max(0, total - (total % pageSize || pageSize)));
    const to = Math.min(from + pageSize, total);
    onSlice(from, to);
  }, [page, total, pageSize, onSlice]);

  if (total <= pageSize) return null;

  return (
    <div className="flex items-center justify-between p-3">
      <div className="text-xs text-slate-600">Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <div className="text-xs text-slate-600">{page} / {pages}</div>
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
      </div>
    </div>
  );
}

const InvoicePager = TablePager;
const LedgerPager = TablePager;

function ModalInvoiceView({ invoice, onClose, onDownload, onSendEmail, onRefresh, onSave }: {
  invoice: any;
  onClose: () => void;
  onDownload: () => void;
  onSendEmail: () => void;
  onRefresh: (id: string) => Promise<void>;
  onSave: (next: { client?: string; subtotal?: number; tax?: number; total?: number }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{ client: string; subtotal: number; tax: number; total: number }>({ client: invoice.client, subtotal: invoice.subtotal, tax: invoice.tax, total: invoice.total });
  const [client, setClient] = useState<{ name: string; vat: string; address: string; city: string; country: string; email: string }>({
    name: invoice.client || '',
    vat: (invoice.clientMeta?.vat as string) || '',
    address: (invoice.clientMeta?.address as string) || '',
    city: (invoice.clientMeta?.city as string) || '',
    country: (invoice.clientMeta?.country as string) || '',
    email: (invoice.clientMeta?.email as string) || '',
  });
  const [company, setCompany] = useState<any>({
    name: invoice.user?.company?.name || '',
    vat: invoice.user?.company?.vat || '',
    reg: invoice.user?.company?.reg || '',
    address1: invoice.user?.company?.address1 || '',
    city: invoice.user?.company?.city || '',
    country: invoice.user?.company?.country || '',
    iban: invoice.user?.company?.iban || '',
    bankName: invoice.user?.company?.bankName || '',
    bic: invoice.user?.company?.bic || '',
  });
  const [items, setItems] = useState<Array<{ desc: string; qty: number; rate: number; tax: number }>>(
    (invoice.items || []).map((it: any) => ({ desc: it.description, qty: it.quantity, rate: Number(it.rate), tax: it.tax }))
  );
  const [rateInputs, setRateInputs] = useState<string[]>(
    (invoice.items || []).map((it: any) => {
      const v = Number(it.rate ?? 0);
      return Number.isFinite(v) ? v.toFixed(2) : '0.00';
    })
  );

  const totals = (() => {
    const subtotal = items.reduce((s, it) => s + (Number(it.qty)||0)*(Number(it.rate)||0), 0);
    const tax = items.reduce((s, it) => s + (Number(it.qty)||0)*(Number(it.rate)||0)*((Number(it.tax)||0)/100), 0);
    return { subtotal: Math.round(subtotal), tax: Math.round(tax), total: Math.round(subtotal + tax) };
  })();

  useEffect(() => {
    setForm({ client: invoice.client, subtotal: invoice.subtotal, tax: invoice.tax, total: invoice.total });
    setClient({
      name: invoice.client || '',
      vat: (invoice.clientMeta?.vat as string) || '',
      address: (invoice.clientMeta?.address as string) || '',
      city: (invoice.clientMeta?.city as string) || '',
      country: (invoice.clientMeta?.country as string) || '',
      email: (invoice.clientMeta?.email as string) || '',
    });
    setCompany({
      name: invoice.user?.company?.name || '',
      vat: invoice.user?.company?.vat || '',
      reg: invoice.user?.company?.reg || '',
      address1: invoice.user?.company?.address1 || '',
      city: invoice.user?.company?.city || '',
      country: invoice.user?.company?.country || '',
      iban: invoice.user?.company?.iban || '',
      bankName: invoice.user?.company?.bankName || '',
      bic: invoice.user?.company?.bic || '',
    });
    setItems((invoice.items || []).map((it: any) => ({ desc: it.description, qty: it.quantity, rate: Number(it.rate), tax: it.tax })));
    setRateInputs((invoice.items || []).map((it: any) => {
      const v = Number(it.rate ?? 0);
      return Number.isFinite(v) ? v.toFixed(2) : '0.00';
    }));
  }, [invoice]);

  return (
    <div className="flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-3 border-b border-black/10">
        <div className="text-base font-semibold">Invoice {invoice.number}</div>
        <button className="text-xl leading-none px-2" aria-label="Close" onClick={onClose}>×</button>
      </div>

      <div className="p-3 border-b border-black/10 flex items-center gap-2">
        {!editing ? (
          <>
            <button className="text-sm underline" onClick={() => setEditing(true)}>Edit</button>
            {invoice.status==='Draft' && (<button className="text-sm underline" onClick={()=>alert('Already saved as draft')}>Save draft</button>)}
            <button className="text-sm underline" onClick={onDownload}>Download PDF</button>
            <button className="text-sm underline" onClick={onSendEmail}>Send email</button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 w-full">
              <div className="text-sm text-slate-700">Totals: Subtotal <b>{fmtMoney(totals.subtotal, invoice.currency)}</b> · Tax <b>{fmtMoney(totals.tax, invoice.currency)}</b> · Total <b>{fmtMoney(totals.total, invoice.currency)}</b></div>
              <div className="ml-auto flex items-center gap-2">
                <button className="text-sm underline" onClick={async()=>{
                  await fetch('/api/company', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(company) });
                  await fetch(`/api/invoices/${invoice.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      client: client.name,
                      clientMeta: { vat: client.vat, address: client.address, city: client.city, country: client.country, email: client.email, iban: (client as any).iban || '', bankName: (client as any).bankName || '', bic: (client as any).bic || '' },
                      items: items.map(it=>({ description: it.desc, quantity: it.qty, rate: it.rate, tax: it.tax }))
                    })
                  });
                  setEditing(false);
                  await onRefresh(invoice.id);
                }}>Save</button>
                <button className="text-sm" onClick={()=>{ setEditing(false); }}>Cancel</button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 110px)' }}>
        {!editing ? (
          <div className="max-w-[800px] mx-auto">
            <InvoiceA4
              currency={invoice.currency}
              items={(invoice.items||[]).map((it:any)=>({ desc: it.description, qty: it.quantity, rate: it.rate, tax: it.tax }))}
              subtotal={invoice.subtotal}
              taxTotal={invoice.tax}
              total={invoice.total}
              sender={{ company: invoice.user?.company?.name || 'Company', vat: invoice.user?.company?.vat, address: invoice.user?.company?.address1, city: invoice.user?.company?.city, country: invoice.user?.company?.country, iban: invoice.user?.company?.iban, bankName: invoice.user?.company?.bankName, bic: invoice.user?.company?.bic }}
              client={{ name: invoice.client, vat: (invoice.clientMeta?.vat as string) || undefined, address: (invoice.clientMeta?.address as string) || undefined, city: (invoice.clientMeta?.city as string) || undefined, country: (invoice.clientMeta?.country as string) || undefined }}
              invoiceNo={invoice.number}
              invoiceDate={new Date(invoice.date).toISOString().slice(0,10)}
              invoiceDue={''}
              notes={''}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            <div className="grid gap-2">
              <div className="text-sm font-semibold">Seller</div>
              <input className="rounded border px-2 py-1 text-sm" placeholder="Company name" value={company.name} onChange={(e)=>setCompany({ ...company, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="VAT" value={company.vat} onChange={(e)=>setCompany({ ...company, vat: e.target.value })} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="Reg" value={company.reg} onChange={(e)=>setCompany({ ...company, reg: e.target.value })} />
              </div>
              <input className="rounded border px-2 py-1 text-sm" placeholder="Address line" value={company.address1} onChange={(e)=>setCompany({ ...company, address1: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="City" value={company.city} onChange={(e)=>setCompany({ ...company, city: e.target.value })} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="Country" value={company.country} onChange={(e)=>setCompany({ ...company, country: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="IBAN" value={company.iban} onChange={(e)=>setCompany({ ...company, iban: e.target.value })} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="Bank name" value={company.bankName} onChange={(e)=>setCompany({ ...company, bankName: e.target.value })} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="SWIFT / BIC" value={company.bic} onChange={(e)=>setCompany({ ...company, bic: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold">Client</div>
              <input className="rounded border px-2 py-1 text-sm" placeholder="Client name" value={client.name} onChange={(e)=>setClient({ ...client, name: e.target.value })} />
              <input className="rounded border px-2 py-1 text-sm" placeholder="Email address" type="email" value={client.email} onChange={(e)=>setClient({ ...client, email: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="VAT" value={client.vat} onChange={(e)=>setClient({ ...client, vat: e.target.value })} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="City" value={client.city} onChange={(e)=>setClient({ ...client, city: e.target.value })} />
              </div>
              <input className="rounded border px-2 py-1 text-sm" placeholder="Address line" value={client.address} onChange={(e)=>setClient({ ...client, address: e.target.value })} />
              <input className="rounded border px-2 py-1 text-sm" placeholder="Country" value={client.country} onChange={(e)=>setClient({ ...client, country: e.target.value })} />
              <div className="text-xs text-slate-600 mt-2">Bank details (optional)</div>
              <div className="grid grid-cols-3 gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="IBAN" value={(client as any).iban || ''} onChange={(e)=>setClient({ ...(client as any), iban: e.target.value } as any)} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="Bank name" value={(client as any).bankName || ''} onChange={(e)=>setClient({ ...(client as any), bankName: e.target.value } as any)} />
                <input className="rounded border px-2 py-1 text-sm" placeholder="SWIFT / BIC" value={(client as any).bic || ''} onChange={(e)=>setClient({ ...(client as any), bic: e.target.value } as any)} />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold">Items</div>
              <div className="grid gap-1">
                <div className="grid grid-cols-12 gap-1 text-[11px] text-slate-600">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Tax %</div>
                </div>
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1">
                    <input className="col-span-6 rounded border px-2 py-1 text-sm" value={it.desc} onChange={(e)=>setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, desc: e.target.value } : p))} />
                    <input className="col-span-2 rounded border px-2 py-1 text-sm text-right" type="text" inputMode="numeric" value={it.qty} onChange={(e)=>{ const v=(e.target.value||'').replace(/[^0-9]/g,''); setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, qty: Number(v||0) } : p)); }} />
                    <input
                      className="col-span-2 rounded border px-2 py-1 text-sm text-right"
                      type="text"
                      inputMode="decimal"
                      value={rateInputs[i] ?? ''}
                      onChange={(e)=>{
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
                        setRateInputs(prev => prev.map((v, idx) => idx === i ? s : v));
                        const num = parseFloat(s);
                        const next = Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
                        setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, rate: next } : p));
                      }}
                    />
                    <input className="col-span-2 rounded border px-2 py-1 text-sm text-right" type="number" value={it.tax} onChange={(e)=>setItems(prev=>prev.map((p,idx)=> idx===i? { ...p, tax: Number(e.target.value) } : p))} />
                  </div>
                ))}
                <button className="rounded border border-dashed border-black/20 text-sm py-1" onClick={(e)=>{ e.preventDefault(); setItems(prev=>[...prev, { desc: 'Service', qty: 1, rate: 100, tax: 0 }]); }}>+ Add row</button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold">Invoice Details</div>
              <div className="grid grid-cols-3 gap-2">
                <input className="rounded border px-2 py-1 text-sm" placeholder="Invoice number" value={invoice.number} readOnly />
                <input className="rounded border px-2 py-1 text-sm" type="date" value={new Date(invoice.date).toISOString().slice(0,10)} readOnly />
                <input className="rounded border px-2 py-1 text-sm" type="date" placeholder="Due date" value={invoice.due ? new Date(invoice.due).toISOString().slice(0,10) : ''} readOnly />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
