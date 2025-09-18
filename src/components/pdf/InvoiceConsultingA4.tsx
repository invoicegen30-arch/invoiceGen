'use client';

import React, { useMemo } from 'react';
import { Item } from '@/types/invoice';

export interface InvoiceConsultingA4Props {
  currency: string;
  zeroNote?: string;
  logoUrl?: string;
  items: Item[];
  subtotal: number;
  taxTotal: number;
  total: number;
  sender: {
    company: string;
    vat?: string;
    address?: string;
    city?: string;
    country?: string;
    iban?: string;
    bankName?: string;
    bic?: string;
  };
  client: {
    name: string;
    vat?: string;
    address?: string;
    city?: string;
    country?: string;
    email?: string;
  };
  invoiceNo: string;
  invoiceDate: string;
  invoiceDue: string;
  notes?: string;
}

function money(v: number, currency: string) {
  const abs = Math.abs(v);
  const opts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try {
    return `${v < 0 ? '-' : ''}${currency} ${new Intl.NumberFormat(undefined, opts).format(abs)}`;
  } catch {
    return `${currency} ${abs.toFixed(2)}`;
  }
}

export default function InvoiceConsultingA4({
  currency,
  zeroNote,
  logoUrl,
  items,
  subtotal,
  taxTotal,
  total,
  sender,
  client,
  invoiceNo,
  invoiceDate,
  invoiceDue,
  notes,
}: InvoiceConsultingA4Props) {
  const vatByRate = useMemo(() => {
    const map = new Map<number, number>();
    for (const it of items) {
      const rate = Number(it.tax) || 0;
      const lineBase = (Number(it.qty) || 0) * (Number(it.rate) || 0);
      const tax = lineBase * (rate / 100);
      map.set(rate, (map.get(rate) || 0) + tax);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  return (
    <div className="w-full">
      <style>{`
        @page { size: A4; margin: 12mm 12mm 14mm 12mm; }
        @media print { body { background: white; } }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .muted { color: #64748b; }
        .label { font-size: 11px; color: #334155; letter-spacing: .02em; }
        .right { text-align: right; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { font-size: 11px; text-align: left; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.10); color:#334155 }
        .table td { font-size: 12px; padding: 8px 8px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .summary { border: 1px solid rgba(0,0,0,.12); border-radius: 12px; }
        #print-area, #dash-print-area { display: none; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area *, #dash-print-area, #dash-print-area * { visibility: visible; }
          #print-area, #dash-print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div id="print-area">
        <div className="a4 p-[10mm] flex flex-col">
          {/* Top band: logo + meta + currency */}
          <div className="grid grid-cols-[1fr,1fr,1fr] items-start gap-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-10 w-40 object-contain" />
              ) : (
                <div className="h-10 w-40 rounded bg-slate-100 border border-dashed border-slate-300" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="muted">Invoice №</div><div>{invoiceNo || '-'}</div>
              <div className="muted">Date</div><div>{invoiceDate || '-'}</div>
              <div className="muted">Due</div><div>{invoiceDue || '-'}</div>
              <div className="muted">PO / Ref</div><div>-</div>
            </div>
            <div className="text-right text-sm">
              <div><span className="muted">Currency</span> · {currency}</div>
              {zeroNote && <div className="mt-1 text-emerald-700 text-xs">{zeroNote}</div>}
            </div>
          </div>

          {/* Parties: From / Bill to / Ship to */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">From</div>
              <div className="p-3 rounded border border-slate-200 bg-slate-50">
                <div className="font-semibold">{sender.company}</div>
                {sender.vat && <div className="muted">VAT / Reg {sender.vat}</div>}
                {sender.address && <div>{sender.address}</div>}
                {(sender.city || sender.country) && <div>{sender.city}{sender.city && sender.country ? ', ' : ''}{sender.country}</div>}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Bill to</div>
              <div className="p-3 rounded border border-slate-200 bg-slate-50">
                <div className="font-semibold">{client.name}</div>
                {client.vat && <div className="muted">VAT / Reg {client.vat}</div>}
                {client.address && <div>{client.address}</div>}
                {(client.city || client.country) && <div>{client.city}{client.city && client.country ? ', ' : ''}{client.country}</div>}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Ship to</div>
              <div className="p-3 rounded border border-slate-200 bg-slate-50">—</div>
            </div>
          </div>

          {/* Items table — compact */}
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Items</div>
            <div className="rounded-md overflow-hidden border border-slate-200">
              <div className="grid grid-cols-[50px,120px,1fr,70px,70px,100px,90px,80px,90px,110px] text-[11px] bg-slate-50">
                <div className="px-2 py-2">#</div>
                <div className="px-2 py-2">Item / SKU</div>
                <div className="px-2 py-2">Description</div>
                <div className="px-2 py-2 right">Unit</div>
                <div className="px-2 py-2 right">Qty</div>
                <div className="px-2 py-2 right">Unit price</div>
                <div className="px-2 py-2 right">Discount</div>
                <div className="px-2 py-2 right">Tax %</div>
                <div className="px-2 py-2 right">Tax amt</div>
                <div className="px-2 py-2 right">Line total</div>
              </div>
              {items.map((it, i) => {
                const qty = Number(it.qty) || 0;
                const unit = 'pcs';
                const unitPrice = Number(it.rate) || 0;
                const discountPct = 0;
                const base = qty * unitPrice * (1 - discountPct / 100);
                const taxPct = Number(it.tax) || 0;
                const taxAmt = base * (taxPct / 100);
                const lineTotal = base + taxAmt;
                return (
                  <div key={i} className="grid grid-cols-[50px,120px,1fr,70px,70px,100px,90px,80px,90px,110px] text-[12px] border-t border-slate-100">
                    <div className="px-2 py-2">{i + 1}</div>
                    <div className="px-2 py-2">SKU-{100 + i}</div>
                    <div className="px-2 py-2">{it.desc}</div>
                    <div className="px-2 py-2 right">{unit}</div>
                    <div className="px-2 py-2 right">{qty}</div>
                    <div className="px-2 py-2 right">{money(unitPrice, currency)}</div>
                    <div className="px-2 py-2 right">{discountPct}%</div>
                    <div className="px-2 py-2 right">{taxPct}%</div>
                    <div className="px-2 py-2 right">{money(taxAmt, currency)}</div>
                    <div className="px-2 py-2 right">{money(lineTotal, currency)}</div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] muted mt-2">Discount/Unit columns shown for trade-style detail; discount is 0% by default.</div>
          </div>

          {/* Totals & VAT by rate */}
          <div className="mt-4 grid grid-cols-[1fr,360px] gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <div className="font-semibold mb-1">Bank & References</div>
                <div className="p-3 rounded border border-slate-200 bg-slate-50">
                  {sender.iban && <div><span className="muted">IBAN:</span> {sender.iban}</div>}
                  {sender.bankName && <div><span className="muted">Bank:</span> {sender.bankName}</div>}
                  {sender.bic && <div><span className="muted">BIC:</span> {sender.bic}</div>}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Notes & Regulatory</div>
                <div className="p-3 rounded border border-slate-200 bg-slate-50">{zeroNote || notes || '-'}</div>
              </div>
            </div>
            <div className="summary p-4 shadow-sm rounded-xl">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="muted">Subtotal</div><div className="right">{money(subtotal, currency)}</div>
                <div className="muted">Discount total</div><div className="right">{money(0, currency)}</div>
                <div className="muted">Shipping</div><div className="right">{money(0, currency)}</div>
              </div>
              <div className="h-px bg-slate-200 my-3" />
              <div className="text-sm font-semibold mb-2">VAT by rate</div>
              <div className="grid grid-cols-3 text-[12px] gap-y-1">
                {vatByRate.length === 0 ? (
                  <div className="col-span-3 muted">No VAT</div>
                ) : (
                  vatByRate.map(([rate, amt]) => (
                    <React.Fragment key={rate}>
                      <div className="muted">{rate}%</div>
                      <div className="right col-span-2">{money(amt, currency)}</div>
                    </React.Fragment>
                  ))
                )}
              </div>
              <div className="h-px bg-slate-200 my-3" />
              <div className="grid grid-cols-2 gap-y-2">
                <div className="font-semibold">Grand total</div><div className="text-right font-semibold">{money(total, currency)}</div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 text-[11px] muted">{sender.company} · {client.email || 'info@mail.com'} · Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
}


