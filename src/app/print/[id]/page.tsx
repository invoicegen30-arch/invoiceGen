import { prisma } from '@/lib/prisma';
import InvoiceA4 from '@/components/pdf/InvoiceA4';
import InvoiceConstructionA4 from '@/components/pdf/InvoiceConstructionA4';
import InvoiceITServicesA4 from '@/components/pdf/InvoiceITServicesA4';
import InvoiceConsultingA4 from '@/components/pdf/InvoiceConsultingA4';

export const dynamic = 'force-dynamic';

export default async function PrintInvoicePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<{ due?: string }> }) {
  const { id } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as any;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { items: true, user: { include: { company: true } } } });
  if (!invoice) return <div className="p-6">Not found.</div>;
  const dueStr = (sp?.due as string) || (invoice.due ? new Date(invoice.due as any).toISOString().slice(0,10) : '');

  const templateProps = {
    currency: invoice.currency,
    items: invoice.items.map(it => ({ desc: it.description, qty: it.quantity, rate: Number(it.rate), tax: it.tax })) as any,
    subtotal: Number(invoice.subtotal),
    taxTotal: Number(invoice.tax),
    total: Number(invoice.total),
    sender: {
      company: invoice.user.company?.name || '',
      vat: invoice.user.company?.vat || '',
      address: invoice.user.company?.address1 || '',
      city: invoice.user.company?.city || '',
      country: invoice.user.company?.country || '',
      iban: invoice.user.company?.iban || '',
      bankName: (invoice.user.company as any)?.bankName || undefined,
      bic: invoice.user.company?.bic || undefined,
    },
    logoUrl: (invoice.user.company as any)?.logoUrl || undefined,
    client: {
      name: invoice.client,
      vat: (invoice as any).clientMeta?.vat || '',
      address: (invoice as any).clientMeta?.address || '',
      city: (invoice as any).clientMeta?.city || '',
      country: (invoice as any).clientMeta?.country || '',
    },
    invoiceNo: invoice.number,
    invoiceDate: new Date(invoice.date).toISOString().slice(0, 10),
    invoiceDue: dueStr,
    notes: '',
  };

  const tpl = (invoice as any).template || 'Freelance';

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-none p-0 m-0">
        {tpl === 'Construction' ? (
          <InvoiceConstructionA4 {...templateProps} />
        ) : tpl === 'IT Services' ? (
          <InvoiceITServicesA4 {...templateProps} />
        ) : tpl === 'Consulting' ? (
          <InvoiceConsultingA4 {...templateProps} />
        ) : (
          <InvoiceA4 {...templateProps} />
        )}
      </main>
    </div>
  );
}
