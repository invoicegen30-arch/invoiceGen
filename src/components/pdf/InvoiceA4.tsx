'use client';

import React from 'react';
import { Item } from '@/types/invoice';

export interface InvoiceA4Props {
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

export default function InvoiceA4({
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
}: InvoiceA4Props) {
  return (
    <div className="w-full">
      <style>{`
        @page { size: A4; margin: 14mm 14mm 16mm 14mm; }
        @media print { body { background: white; } }
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
        .cut { height: 8mm; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
        .muted { color: #64748b; }
        .label { font-size: 11px; color: #334155; text-transform: uppercase; letter-spacing: .04em; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { font-size: 11px; text-align: left; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.08); color:#334155 }
        .table td { font-size: 12px; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.04); }
        .right { text-align: right; }
        .totals td { font-weight: 600; }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        .footer { position: running(footer); font-size: 11px; color: #64748b; }

        /* Keep the print area hidden on screen */
        #print-area, #dash-print-area { display: none; }

        /* Print isolation: only print the print-area when printing */
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area *, #dash-print-area, #dash-print-area * { visibility: visible; }
          #print-area, #dash-print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div id="print-area">
        <div className="a4 p-[10mm]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-10 w-28 object-contain" />
              ) : (
                <>
                  <div className="h-10 w-10 rounded-lg bg-blue-600" />
                  <div className="text-slate-900 font-semibold text-lg">Invoicerly</div>
                </>
              )}
            </div>
            <div className="text-right text-sm text-slate-600">
              <div className="font-semibold text-slate-800">Invoice {invoiceNo}</div>
              <div>Date: {invoiceDate || '-'}</div>
              <div>Due: {invoiceDue || '-'}</div>
            </div>
          </div>

          <div className="cut" />

          <div className="grid-2">
            <div className="avoid-break">
              <div className="label">From</div>
              <div className="mt-1 text-sm">
                <div className="font-semibold">{sender.company}</div>
                {sender.vat && <div className="muted">VAT {sender.vat}</div>}
                {sender.address && <div>{sender.address}</div>}
                {(sender.city || sender.country) && <div>{sender.city}{sender.city && sender.country ? ', ' : ''}{sender.country}</div>}
              </div>
            </div>
            <div className="avoid-break">
              <div className="label">Bill To</div>
              <div className="mt-1 text-sm">
                <div className="font-semibold">{client.name}</div>
                {client.email && <div className="muted">{client.email}</div>}
                {client.vat && <div className="muted">VAT {client.vat}</div>}
                {client.address && <div>{client.address}</div>}
                {(client.city || client.country) && <div>{client.city}{client.city && client.country ? ', ' : ''}{client.country}</div>}
              </div>
            </div>
          </div>

          <div className="cut" />

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '54%' }}>Item</th>
                <th className="right" style={{ width: '10%' }}>Qty</th>
                <th className="right" style={{ width: '18%' }}>Rate ({currency})</th>
                <th className="right" style={{ width: '18%' }}>Tax</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="avoid-break">
                  <td>{it.desc}</td>
                  <td className="right">{it.qty}</td>
                  <td className="right">{money(it.rate, currency)}</td>
                  <td className="right">{it.tax}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cut" />

          <div className="grid-2">
            <div className="avoid-break">
              <div className="label">Payment details</div>
              <div className="mt-1 text-sm">
                {sender.iban && (
                  <div><span className="muted">IBAN:</span> {sender.iban}</div>
                )}
                {sender.bankName && (
                  <div><span className="muted">Bank:</span> {sender.bankName}</div>
                )}
                {sender.bic && (
                  <div><span className="muted">BIC:</span> {sender.bic}</div>
                )}
                {zeroNote && <div className="mt-2 text-emerald-700 text-xs">{zeroNote}</div>}
              </div>
            </div>
            <div className="avoid-break">
              <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <tbody>
                  <tr>
                    <td className="right muted">Subtotal</td>
                    <td className="right" style={{ width: '40%' }}>{money(subtotal, currency)}</td>
                  </tr>
                  <tr>
                    <td className="right muted">Tax</td>
                    <td className="right">{money(taxTotal, currency)}</td>
                  </tr>
                  <tr className="totals">
                    <td className="right">Total</td>
                    <td className="right">{money(total, currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {notes && (
            <div className="avoid-break mt-6">
              <div className="label">Notes</div>
              <div className="mt-1 text-sm">{notes}</div>
            </div>
          )}

          <div className="cut" />

          <div className="footer">Invoicerly · info@mail.com · This PDF is generated electronically and is valid without a signature.</div>
        </div>
      </div>
    </div>
  );
}
