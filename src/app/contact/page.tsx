import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Pill from '@/components/policy/Pill';
import ContactForm from '@/components/contact/ContactForm';

export const metadata = {
  title: 'Contact - Invoicerly',
  description: 'Get in touch with sales, support, or billing.',
};

export default function ContactPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      <Section className="py-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <Pill>UK-first</Pill>
            <Pill>EU-ready</Pill>
            <Pill>Avg. reply: 1 business day</Pill>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900">Contact us</h1>
          <p className="mt-3 text-slate-600 text-lg">We're here to help with sales, support, and billing.</p>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

            <div className="space-y-6">
              <Card className="p-6" padding="md">
                <h3 className="text-base font-semibold">Contact details</h3>
                <div className="mt-3 grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between"><div>Sales</div><a className="underline" href="mailto:info@invoicerly.co.uk">info@invoicerly.co.uk</a></div>
                  <div className="flex items-center justify-between"><div>Support</div><a className="underline" href="mailto:info@invoicerly.co.uk">info@invoicerly.co.uk</a></div>
                  <div className="flex items-center justify-between"><div>Billing</div><a className="underline" href="mailto:info@invoicerly.co.uk">info@invoicerly.co.uk</a></div>
                  <div className="flex items-center justify-between"><div>Privacy (DPO)</div><a className="underline" href="mailto:info@invoicerly.co.uk">info@invoicerly.co.uk</a></div>
                  <div className="flex items-center justify-between"><div>Phone</div><a className="underline" href="tel:+447822016497">+44 7822 016497</a></div>
                </div>
                <div className="mt-4 text-xs text-slate-500">Hours: Mon-Fri, 09:00-18:00 (UK). Limited support on EU public holidays.</div>
              </Card>

              <Card className="p-6" padding="md">
                <h3 className="text-base font-semibold">Offices</h3>
                <div className="mt-3 grid gap-4 text-sm text-slate-700">
                  <div>
                    <div className="font-medium">United Kingdom (Primary)</div>
                    <div>PREPARING BUSINESS LTD</div>
                    <div>Dept 6189 43 Owston Road, Carcroft,<br/>Doncaster, UK, DN6 8DA</div>
                  </div>
                </div>
                <div className="mt-4 h-40 rounded-xl overflow-hidden border border-black/10">
                  <iframe
                    title="Invoicerly Office Location"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Dept%206189%2043%20Owston%20Road%2C%20Carcroft%2C%20Doncaster%2C%20UK%2C%20DN6%208DA&output=embed"
                  />
                </div>
              </Card>
            </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Card className="p-4" padding="sm"><div className="text-sm font-medium">Sales</div><div className="text-slate-600 text-sm mt-1">Demos, quotes, volume pricing.</div></Card>
          <Card className="p-4" padding="sm"><div className="text-sm font-medium">Support</div><div className="text-slate-600 text-sm mt-1">Product questions & bug reports.</div></Card>
          <Card className="p-4" padding="sm"><div className="text-sm font-medium">Billing</div><div className="text-slate-600 text-sm mt-1">Invoices, VAT, refunds.</div></Card>
        </div>
      </Section>
    </main>
  );
}
