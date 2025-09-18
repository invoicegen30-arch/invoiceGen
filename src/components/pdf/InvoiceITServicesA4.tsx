'use client';

import React from 'react';
import { Item } from '@/types/invoice';

export interface InvoiceITServicesA4Props {
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

export default function InvoiceITServicesA4({
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
}: InvoiceITServicesA4Props) {
  return (
    <div className="w-full">
      <style>{`
        @page { size: A4; margin: 14mm 14mm 16mm 14mm; }
        @media print { body { background: white; } }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .muted { color: #64748b; }
        .label { font-size: 11px; color: #334155; letter-spacing: .02em; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { font-size: 11px; text-align: left; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.10); color:#334155 }
        .table td { font-size: 12px; padding: 8px 8px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .right { text-align: right; }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .summary { border: 1px solid rgba(0,0,0,.12); border-radius: 12px; }
        .footer { position: running(footer); font-size: 11px; color: #64748b; }
        #print-area, #dash-print-area { display: none; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area *, #dash-print-area, #dash-print-area * { visibility: visible; }
          #print-area, #dash-print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div id="print-area">
        <div className="a4 p-[12mm] grid grid-cols-[1fr,80mm] gap-6">
          {/* Left column */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-semibold text-slate-800">INVOICE</div>
                <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <div className="text-slate-500">Invoice №</div><div>{invoiceNo || '-'}</div>
                  <div className="text-slate-500">Date</div><div>{invoiceDate || '-'}</div>
                  <div className="text-slate-500">Due</div><div>{invoiceDue || '-'}</div>
                  <div className="text-slate-500">PO / Ref</div><div>-</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-10 w-28 object-contain" />
                ) : (
                  <div className="w-28 h-10 rounded bg-slate-100 border border-dashed border-slate-300" />
                )}
              </div>
            </div>

            {/* Parties */}
            <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
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
            </div>

            {/* Items */}
            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">Items</div>
              <div className="rounded-md overflow-hidden border border-slate-200">
                <div className="grid grid-cols-[1fr,90px,110px,80px,120px] text-xs bg-slate-50">
                  <div className="px-3 py-2">Description</div>
                  <div className="px-3 py-2 text-right">Qty</div>
                  <div className="px-3 py-2 text-right">Unit</div>
                  <div className="px-3 py-2 text-right">Tax</div>
                  <div className="px-3 py-2 text-right">Line total</div>
                </div>
                {items.map((it, i) => {
                  const lineTotal = (Number(it.qty) || 0) * (Number(it.rate) || 0) * (1 + (Number(it.tax) || 0)/100);
                  return (
                    <div key={i} className="grid grid-cols-[1fr,90px,110px,80px,120px] text-sm border-t border-slate-100">
                      <div className="px-3 py-2">{it.desc}</div>
                      <div className="px-3 py-2 text-right">{it.qty}</div>
                      <div className="px-3 py-2 text-right">{money(it.rate, currency)}</div>
                      <div className="px-3 py-2 text-right">{it.tax}%</div>
                      <div className="px-3 py-2 text-right">{money(lineTotal, currency)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer notes */}
            <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="font-semibold mb-1">VAT / Legal notes</div>
                <div className="p-3 rounded border border-slate-200 bg-slate-50">
                  {zeroNote || '-'}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Additional info</div>
                <div className="p-3 rounded border border-slate-200 bg-slate-50">
                  {notes || 'Payment within 14 days.'}
                </div>
              </div>
            </div>

            <div className="mt-auto text-[11px] text-slate-500">{sender.company} · {client.email || 'info@mail.com'}</div>
          </div>

          {/* Right column (summary + payment) */}
          <div className="flex flex-col">
            <div className="summary rounded-xl p-4 shadow-sm">
              <div className="text-sm font-semibold">Invoice summary</div>
              <div className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
                <div className="muted">Subtotal</div><div className="right">{money(subtotal, currency)}</div>
                <div className="muted">Tax</div><div className="right">{money(taxTotal, currency)}</div>
                <div className="h-px bg-slate-200 col-span-2 my-1" />
                <div className="font-semibold">Total</div><div className="text-right font-semibold">{money(total, currency)}</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-semibold">Payment</div>
              <div className="text-sm mt-2">
                {sender.iban && <div><span className="muted">IBAN:</span> {sender.iban}</div>}
                {sender.bankName && <div><span className="muted">Bank:</span> {sender.bankName}</div>}
                {sender.bic && <div><span className="muted">BIC:</span> {sender.bic}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


