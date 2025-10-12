'use client';

import { motion } from 'framer-motion';
import { Item } from '@/types/invoice';

interface InvoicePaperProps {
  currency: string;
  zeroNote?: string;
  logoUrl?: string;
  items: Item[];
  subtotal: number;
  taxTotal: number;
  total: number;
  sender: { company: string; vat: string; address: string; city: string; country: string; iban: string; bankName?: string; bic?: string };
  client: { name: string; vat: string; address: string; city: string; country: string; email?: string };
  invoiceNo: string;
  invoiceDate: string;
  invoiceDue: string;
  notes: string;
}

export default function InvoicePaper({
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
}: InvoicePaperProps) {
  return (
    <motion.div 
      className="w-full h-[520px] rounded-xl bg-white border border-black/10 shadow-sm p-6 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between">
        <motion.div
          className="h-10 w-10 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center"
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
          ) : null}
        </motion.div>
        <div className="text-right text-xs text-slate-600">
          <div>Invoice {invoiceNo ? `#${invoiceNo}` : ''}</div>
          <div>Date: {invoiceDate || '-'}</div>
          <div>Due: {invoiceDue || '-'}</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-6 text-xs">
        <div>
          <div className="font-semibold">From</div>
          <div>{sender.company}</div>
          <div>VAT {sender.vat}</div>
          <div>{sender.city}, {sender.country}</div>
        </div>
        <div>
          <div className="font-semibold">Bill To</div>
          <div>{client.name}</div>
          {client.email && <div className="text-slate-600">{client.email}</div>}
          <div>VAT {client.vat}</div>
          <div>{client.city}, {client.country}</div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium border-b border-black/10 pb-2">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Tax</div>
        </div>
        
        {items.map((item, i) => (
          <motion.div 
            key={i} 
            className="grid grid-cols-12 gap-2 text-xs py-2 border-b border-black/5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="col-span-6 truncate">{item.desc}</div>
            <div className="col-span-2 text-right">{item.qty}</div>
            <div className="col-span-2 text-right">{currency} {item.rate.toFixed(2)}</div>
            <div className="col-span-2 text-right">{item.tax}%</div>
          </motion.div>
        ))}
        
        {/* Payment details preview (like A4) */}
        <div className="grid grid-cols-2 gap-6 text-xs mt-3">
          <div>
            <div className="font-medium text-slate-600 uppercase">Payment details</div>
            <div className="mt-1">
              {sender.iban && <div><span className="text-slate-500">IBAN:</span> {sender.iban}</div>}
              {sender.bankName && <div><span className="text-slate-500">Bank:</span> {sender.bankName}</div>}
              {sender.bic && <div><span className="text-slate-500">BIC:</span> {sender.bic}</div>}
              {zeroNote && <div className="mt-2 text-emerald-700">{zeroNote}</div>}
            </div>
          </div>
        </div>
        
        <motion.div 
          className="mt-4 ml-auto w-64 text-xs space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">{currency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-mono">{currency} {taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-black/10 pt-1">
            <span>Total</span>
            <span className="font-mono">{currency} {total.toFixed(2)}</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-4 text-[11px] text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {notes || 'Payment within 14 days.'} {sender.iban ? `IBAN: ${sender.iban}` : ''}
        </motion.div>
      </div>
    </motion.div>
  );
}



