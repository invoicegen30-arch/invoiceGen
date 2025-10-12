'use client';

import { motion } from 'framer-motion';

interface TemplatePreviewProps {
  template: 'Freelance' | 'Construction' | 'IT Services' | 'Consulting';
  className?: string;
}

export default function TemplatePreview({ template, className = '' }: TemplatePreviewProps) {
  const getTemplateContent = () => {
    switch (template) {
      case 'Freelance':
        return (
          <div className="p-2 bg-white rounded border border-slate-200 text-[8px] leading-tight">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-semibold">ACME LTD</div>
                <div className="text-slate-500">221B Baker Street, London</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">INVOICE</div>
                <div className="text-slate-500">#INV-2025-001</div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-1 mb-1">
              <div className="text-slate-600">Bill to: Client GmbH</div>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Web Development</span>
                <span>£100.00</span>
              </div>
              <div className="flex justify-between">
                <span>Design Services</span>
                <span>£200.00</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>£360.00</span>
              </div>
            </div>
          </div>
        );
      
      case 'Construction':
        return (
          <div className="p-2 bg-white rounded border border-slate-200 text-[8px] leading-tight">
            <div className="text-center mb-1">
              <div className="font-bold text-[10px]">BUILD CORP</div>
              <div className="text-slate-500">Construction Services</div>
            </div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-slate-600">Invoice #001</div>
              <div className="text-slate-600">Date: 2025-01-15</div>
            </div>
            <div className="border-t border-slate-200 pt-1 mb-1">
              <div className="text-slate-600">Client: ABC Construction</div>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Foundation Work</span>
                <span>£1,500.00</span>
              </div>
              <div className="flex justify-between">
                <span>Materials</span>
                <span>£800.00</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>£2,760.00</span>
              </div>
            </div>
          </div>
        );
      
      case 'IT Services':
        return (
          <div className="p-2 bg-white rounded border border-slate-200 text-[8px] leading-tight">
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="font-semibold">TECH SOLUTIONS</div>
                <div className="text-slate-500">IT Consulting</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">INVOICE</div>
                <div className="text-slate-500">#TS-2025-001</div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-1 mb-1">
              <div className="text-slate-600">Bill to: Startup Inc</div>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>System Setup</span>
                <span>£500.00</span>
              </div>
              <div className="flex justify-between">
                <span>Consulting</span>
                <span>£300.00</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>£960.00</span>
              </div>
            </div>
          </div>
        );
      
      case 'Consulting':
        return (
          <div className="p-2 bg-white rounded border border-slate-200 text-[8px] leading-tight">
            <div className="text-center mb-1">
              <div className="font-bold text-[10px]">CONSULT PRO</div>
              <div className="text-slate-500">Business Consulting</div>
            </div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-slate-600">Invoice #CP-001</div>
              <div className="text-slate-600">Due: 2025-02-15</div>
            </div>
            <div className="border-t border-slate-200 pt-1 mb-1">
              <div className="text-slate-600">Client: Enterprise Ltd</div>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Strategy Session</span>
                <span>£400.00</span>
              </div>
              <div className="flex justify-between">
                <span>Analysis Report</span>
                <span>£600.00</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-1 mt-1">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>£1,200.00</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {getTemplateContent()}
    </motion.div>
  );
}
