import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log(`[PDF_API] Generating PDF for invoice ${id}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    const urlObj = new URL(req.url);
    const due = urlObj.searchParams.get('due');
    const q = due ? `?due=${encodeURIComponent(due)}` : '';
    const url = `${origin}/print/${id}${q}`;
    
    console.log(`[PDF_API] Base URL: ${baseUrl}`);
    console.log(`[PDF_API] Origin: ${origin}`);
    console.log(`[PDF_API] Print URL: ${url}`);

    const isLocal = process.env.NODE_ENV === 'development';
    console.log(`[PDF_API] Environment: ${process.env.NODE_ENV}`);
    console.log(`[PDF_API] Is local: ${isLocal}`);
    
    const execPath = isLocal ? undefined : await chromium.executablePath();
    console.log(`[PDF_API] Exec path: ${execPath}`);

    const browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
      executablePath: execPath,
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();
      console.log(`[PDF_API] Navigating to: ${url}`);
      
      // Set timeout for page load
      await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000 // 30 seconds timeout
      });
      console.log(`[PDF_API] Page loaded, generating PDF...`);
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
        preferCSSPageSize: true,
      });
      
      console.log(`[PDF_API] PDF generated, size: ${pdfBuffer.length} bytes`);

      const body = new Uint8Array(pdfBuffer);
      const fileName = `invoice-${id || 'document'}.pdf`;
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-store',
        },
      });
    } finally {
      try { await browser.close(); } catch {}
    }
  } catch (e: any) {
    console.error(`[PDF_API] Error:`, e);
    return NextResponse.json({ 
      error: e?.message || 'Failed to render PDF',
      details: e?.stack || 'No stack trace available'
    }, { status: 500 });
  }
}

