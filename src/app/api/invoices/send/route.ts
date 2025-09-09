import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

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

    console.log(`[INVOICE_SEND] Fetching PDF for invoice ${invoice.id}`);
    const pdfUrl = absoluteUrl(`/api/pdf/${invoice.id}`);
    console.log(`[INVOICE_SEND] PDF URL: ${pdfUrl}`);
    
    const pdfResponse = await fetch(pdfUrl);
    console.log(`[INVOICE_SEND] PDF response status: ${pdfResponse.status}`);
    
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error(`[INVOICE_SEND] PDF fetch error: ${errorText}`);
      throw new Error(`Failed to fetch PDF for attachment: ${pdfResponse.status} ${errorText}`);
    }
    const pdfBlob = await pdfResponse.blob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

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
