import InvoiceA4 from '@/components/pdf/InvoiceA4';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

 // Пропсы под Next 15: params/searchParams — Promise
 type SharedInvoicePageProps = {
   params: Promise<{ id: string }>;
   // не используем, но оставляем для совместимости с общей сигнатурой
   searchParams?: Promise<Record<string, string | string[] | undefined>>;
 };

 export default async function SharedInvoicePage(props: SharedInvoicePageProps) {
   const { id } = await props.params;

   const invoice = await prisma.invoice.findUnique({
    where: { id },
     include: {
       user: {
         include: {
           company: true,
         },
       },
       items: true,
     },
   });

   if (!invoice) {
     notFound();
   }

   return (
     <main className="bg-slate-100 p-4 sm:p-8">
       <div className="max-w-4xl mx-auto bg-white shadow-lg">
         <InvoiceA4
           currency={invoice.currency}
           items={invoice.items.map(it => ({
             desc: it.description,
             qty: it.quantity,
             rate: it.rate.toNumber(),
             tax: it.tax
           }))}
           subtotal={invoice.subtotal.toNumber()}
           taxTotal={invoice.tax.toNumber()}
           total={invoice.total.toNumber()}
           sender={{
             company: invoice.user?.company?.name || 'N/A',
             vat: invoice.user?.company?.vat || undefined,
             address: invoice.user?.company?.address1 || undefined,
             city: invoice.user?.company?.city || undefined,
             country: invoice.user?.company?.country || undefined,
             iban: invoice.user?.company?.iban || undefined,
             bankName: invoice.user?.company?.bankName || undefined,
             bic: invoice.user?.company?.bic || undefined
           }}
           client={{
             name: invoice.client,
             vat: (invoice.clientMeta as any)?.vat || undefined,
             address: (invoice.clientMeta as any)?.address || undefined,
             city: (invoice.clientMeta as any)?.city || undefined,
             country: (invoice.clientMeta as any)?.country || undefined,
           }}
           invoiceNo={invoice.number}
           invoiceDate={new Date(invoice.date).toISOString().slice(0, 10)}
           invoiceDue={invoice.due ? new Date(invoice.due).toISOString().slice(0, 10) : ''}
           notes={''}
         />
       </div>
     </main>
   );
 }
