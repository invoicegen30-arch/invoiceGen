import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const resend = new Resend(process.env.RESEND_API_KEY);

const absoluteUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
};

// Функция теперь принимает только один аргумент `req`
export async function POST(req: Request) {
  try {
    console.log(`[INVOICE_SEND] Starting email send process`);
    console.log(`[INVOICE_SEND] RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
    console.log(`[INVOICE_SEND] EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ИЗМЕНЕНО: Получаем и email, и invoiceId из тела запроса
    const { email: toEmail, invoiceId } = await req.json();
    if (!toEmail || !invoiceId) {
      return NextResponse.json(
        { message: "Recipient email and Invoice ID are required" },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId, // Используем ID из тела запроса
        userId: session.user.id,
      },
      include: { user: { include: { company: true } } },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    console.log(`[INVOICE_SEND] Generating PDF for invoice ${invoice.id}`);
    
    // Generate PDF directly instead of fetching from API
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const printUrl = `${origin}/print/${invoice.id}`;
    
    console.log(`[INVOICE_SEND] Print URL: ${printUrl}`);
    
    const isLocal = process.env.NODE_ENV === 'development';
    const execPath = isLocal ? undefined : await chromium.executablePath();
    
    const browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
      executablePath: execPath,
      headless: chromium.headless,
    });
    
    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      console.log(`[INVOICE_SEND] Navigating to: ${printUrl}`);
      await page.goto(printUrl, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000
      });
      console.log(`[INVOICE_SEND] Page loaded, generating PDF...`);
      
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
        preferCSSPageSize: true,
      });
      
      console.log(`[INVOICE_SEND] PDF generated, size: ${pdfBuffer.length} bytes`);
    } catch (pdfError) {
      console.error(`[INVOICE_SEND] PDF generation error:`, pdfError);
      throw new Error(`Failed to generate PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    } finally {
      try { await browser.close(); } catch {}
    }

    await resend.emails.send({
      from: `Invoicerly <${process.env.EMAIL_FROM || "info@invoicerly.co.uk"}>`,
      to: toEmail,
      subject: `Invoice ${invoice.number} from ${invoice.user?.company?.name || "Invoicerly"}`,
      html: `<p>Please find your invoice attached.</p>`,
      attachments: [
        {
          filename: `Invoice-${invoice.number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("[INVOICE_SEND_ERROR]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
