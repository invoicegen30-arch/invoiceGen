import React from "react";

// Template C — Compact Trade (Wireframe)
// Dense, item‑heavy invoice with extended table columns and VAT by rate summary.

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <div className="mx-auto bg-white shadow-sm border border-black/10 rounded-lg" style={{ width: 794, height: 1123 }}>
        {children}
      </div>
    </div>
  );
}

function Placeholder({ className = "", label = "" }: { className?: string; label?: string }) {
  return (
    <div className={`bg-slate-100 border border-dashed border-slate-300 ${className}`}>
      {label && <div className="text-[11px] tracking-wide text-slate-500 px-2 py-1">{label}</div>}
    </div>
  );
}

export default function TemplateCCompactTradeWireframe() {
  return (
    <PageFrame>
      <div className="p-6 text-slate-800 h-full flex flex-col">
        {/* Top band: logo + meta + currency */}
        <div className="grid grid-cols-[1fr,1fr,1fr] items-start gap-4">
          <Placeholder className="h-10 rounded" label="LOGO" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="text-slate-500">Invoice №</div><div>INV-2025-000123</div>
            <div className="text-slate-500">Date</div><div>02 Sep 2025</div>
            <div className="text-slate-500">Due</div><div>16 Sep 2025</div>
            <div className="text-slate-500">PO / Ref</div><div>PO-4491</div>
          </div>
          <div className="text-right text-sm">
            <div><span className="text-slate-500">Currency</span> · GBP</div>
            <div className="mt-1 text-slate-500">Delivery (optional)</div>
          </div>
        </div>

        {/* Parties: From / Bill to / Ship to */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-1">From</div>
            <Placeholder className="h-20 rounded" label="Seller (company · VAT/Reg · address)" />
          </div>
          <div>
            <div className="font-semibold mb-1">Bill to</div>
            <Placeholder className="h-20 rounded" label="Client (name · VAT/Reg · address)" />
          </div>
          <div>
            <div className="font-semibold mb-1">Ship to</div>
            <Placeholder className="h-20 rounded" label="Delivery address (optional)" />
          </div>
        </div>

        {/* Items table — dense columns */}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">Items</div>
          <div className="rounded-md overflow-hidden border border-slate-200">
            <div className="grid grid-cols-[50px,120px,1fr,70px,70px,100px,90px,80px,90px,110px] text-[11px] bg-slate-50">
              <div className="px-2 py-2">#</div>
              <div className="px-2 py-2">Item / SKU</div>
              <div className="px-2 py-2">Description</div>
              <div className="px-2 py-2 text-right">Unit</div>
              <div className="px-2 py-2 text-right">Qty</div>
              <div className="px-2 py-2 text-right">Unit price</div>
              <div className="px-2 py-2 text-right">Discount</div>
              <div className="px-2 py-2 text-right">Tax %</div>
              <div className="px-2 py-2 text-right">Tax amt</div>
              <div className="px-2 py-2 text-right">Line total</div>
            </div>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="grid grid-cols-[50px,120px,1fr,70px,70px,100px,90px,80px,90px,110px] text-[12px] border-t border-slate-100">
                <div className="px-2 py-2">{i+1}</div>
                <div className="px-2 py-2">SKU-{100+i}</div>
                <div className="px-2 py-2">Item description #{i+1}</div>
                <div className="px-2 py-2 text-right">pcs</div>
                <div className="px-2 py-2 text-right">10</div>
                <div className="px-2 py-2 text-right">£12.00</div>
                <div className="px-2 py-2 text-right">0%</div>
                <div className="px-2 py-2 text-right">20%</div>
                <div className="px-2 py-2 text-right">£24.00</div>
                <div className="px-2 py-2 text-right">£144.00</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Hidden columns (Discount/Unit) can collapse automatically when empty.</div>
        </div>

        {/* Totals & VAT by rate */}
        <div className="mt-4 grid grid-cols-[1fr,360px] gap-6 text-sm">
          {/* Left: Notes / References */}
          <div className="space-y-4">
            <div>
              <div className="font-semibold mb-1">Bank & References</div>
              <Placeholder className="h-20 rounded" label="IBAN/BIC · Sort code/Account (optional) · Payment terms" />
            </div>
            <div>
              <div className="font-semibold mb-1">Notes & Regulatory</div>
              <Placeholder className="h-24 rounded" label="EORI · HS Code · Origin · VAT notes (auto)" />
            </div>
          </div>

          {/* Right: Totals card */}
          <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-slate-500">Subtotal</div><div className="text-right">£720.00</div>
              <div className="text-slate-500">Discount total</div><div className="text-right">£0.00</div>
              <div className="text-slate-500">Shipping</div><div className="text-right">£0.00</div>
            </div>
            <div className="h-px bg-slate-200 my-3" />
            <div className="text-sm font-semibold mb-2">VAT by rate</div>
            <div className="grid grid-cols-3 text-[12px] gap-y-1">
              <div className="text-slate-500">0%</div><div className="text-right col-span-2">£0.00</div>
              <div className="text-slate-500">5%</div><div className="text-right col-span-2">£12.00</div>
              <div className="text-slate-500">20%</div><div className="text-right col-span-2">£96.00</div>
            </div>
            <div className="h-px bg-slate-200 my-3" />
            <div className="grid grid-cols-2 gap-y-2">
              <div className="font-semibold">Grand total</div><div className="text-right font-semibold">£828.00</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 text-[11px] text-slate-500">
          GET STUFFED LTD · Company number 15673179 · Flat 21 County Chambers, 1 Drapery, Northampton, United Kingdom, NN1 2ET · info@invoicerly.co.uk · Page 1 of 1
        </div>
      </div>
    </PageFrame>
  );
}
