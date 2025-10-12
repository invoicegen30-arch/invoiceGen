'use client';

import React from 'react';
import { Item } from '@/types/invoice';

export interface InvoiceConstructionA4Props {
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

export default function InvoiceConstructionA4({
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
}: InvoiceConstructionA4Props) {
  return (
    <div className="w-full">
      <style>{`
        @page { size: A4; margin: 14mm 14mm 16mm 14mm; }
        @media print { body { background: white; } }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .muted { color: #64748b; }
        .label { font-size: 11px; color: #334155; letter-spacing: .02em; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { font-size: 11px; text-align: left; padding: 6px 8px; border-bottom: 1px dashed rgba(0,0,0,.15); color:#334155 }
        .table td { font-size: 12px; padding: 8px 8px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .right { text-align: right; }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .footer { position: running(footer); font-size: 11px; color: #64748b; }
        #print-area, #dash-print-area { display: none; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area *, #dash-print-area, #dash-print-area * { visibility: visible; }
          #print-area, #dash-print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div id="print-area">
        <div className="a4 p-[12mm]">
          {/* Accent line */}
          <div className="h-1 w-full rounded bg-gradient-to-r from-yellow-400 via-amber-300 to-transparent" />

          {/* Header */}
          <div className="mt-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-10 w-28 object-contain" />
              ) : (
                <div className="h-10 w-40 rounded bg-slate-100 border border-dashed border-slate-300" />
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-slate-800">INVOICE</div>
              <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="text-slate-500">Invoice №</div><div>{invoiceNo || '-'}</div>
                <div className="text-slate-500">Date</div><div>{invoiceDate || '-'}</div>
                <div className="text-slate-500">Due</div><div>{invoiceDue || '-'}</div>
                <div className="text-slate-500">PO / Ref</div><div>-</div>
              </div>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-1">From</div>
              <div className="p-3 rounded border border-dashed border-slate-300 bg-slate-50">
                <div className="font-semibold">{sender.company}</div>
                {sender.vat && <div className="muted">VAT / Reg {sender.vat}</div>}
                {sender.address && <div>{sender.address}</div>}
                {(sender.city || sender.country) && <div>{sender.city}{sender.city && sender.country ? ', ' : ''}{sender.country}</div>}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Bill to</div>
              <div className="p-3 rounded border border-dashed border-slate-300 bg-slate-50">
                <div className="font-semibold">{client.name}</div>
                {client.vat && <div className="muted">VAT / Reg {client.vat}</div>}
                {client.address && <div>{client.address}</div>}
                {(client.city || client.country) && <div>{client.city}{client.city && client.country ? ', ' : ''}{client.country}</div>}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mt-8">
            <div className="text-sm font-semibold mb-2">Items</div>
            <div className="rounded-lg overflow-hidden border border-slate-200">
              <div className="grid grid-cols-[1fr,80px,100px,80px,120px] text-xs bg-slate-50 border-b border-slate-200">
                <div className="px-3 py-2">Description</div>
                <div className="px-3 py-2 text-right">Qty</div>
                <div className="px-3 py-2 text-right">Rate</div>
                <div className="px-3 py-2 text-right">Tax</div>
                <div className="px-3 py-2 text-right">Line total</div>
              </div>
              {items.map((it, i) => {
                const lineTotal = (Number(it.qty) || 0) * (Number(it.rate) || 0) * (1 + (Number(it.tax) || 0)/100);
                return (
                  <div key={i} className={`grid grid-cols-[1fr,80px,100px,80px,120px] text-sm ${i%2? 'bg-slate-50':''}`}>
                    <div className="px-3 py-3">{it.desc}</div>
                    <div className="px-3 py-3 text-right">{it.qty}</div>
                    <div className="px-3 py-3 text-right">{money(it.rate, currency)}</div>
                    <div className="px-3 py-3 text-right">{it.tax}%</div>
                    <div className="px-3 py-3 text-right">{money(lineTotal, currency)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-8 ml-auto w-[360px] text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-slate-500">Subtotal</div><div className="text-right">{money(subtotal, currency)}</div>
              <div className="text-slate-500">Tax</div><div className="text-right">{money(taxTotal, currency)}</div>
              <div className="text-slate-500">Shipping</div><div className="text-right">{money(0, currency)}</div>
              <div className="h-px bg-slate-200 col-span-2 my-1" />
              <div className="font-semibold">Total</div><div className="text-right font-semibold">{money(total, currency)}</div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-1">Payment details</div>
              <div className="p-3 rounded border border-dashed border-slate-300 bg-slate-50">
                {sender.iban && <div><span className="muted">IBAN:</span> {sender.iban}</div>}
                {sender.bankName && <div><span className="muted">Bank:</span> {sender.bankName}</div>}
                {sender.bic && <div><span className="muted">BIC:</span> {sender.bic}</div>}
                {zeroNote && <div className="mt-2 text-emerald-700 text-xs">{zeroNote}</div>}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Notes</div>
              <div className="p-3 rounded border border-dashed border-slate-300 bg-slate-50">
                {notes || '-'}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-2 text-[11px] text-slate-500">
            {sender.company} · {client.email || 'info@invoicerly.co.uk'} · Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
}




