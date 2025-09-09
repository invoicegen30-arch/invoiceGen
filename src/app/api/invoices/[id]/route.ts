import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const userId = (session.user as any).id as string;

    // Find the invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
      },
      include: { 
        items: true,
        user: { 
          include: { company: true } 
        }
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      invoice: { 
        ...invoice, 
        subtotal: Number(invoice.subtotal), 
        tax: Number(invoice.tax), 
        total: Number(invoice.total) 
      } 
    });
  } catch (error) {
    console.error('[INVOICE_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const userId = (session.user as any).id as string;
    const body = await req.json().catch(() => ({}));

    // Find the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.subtotal && { subtotal: body.subtotal }),
        ...(body.tax && { tax: body.tax }),
        ...(body.total && { total: body.total }),
        ...(body.client && { client: body.client }),
        ...(body.clientMeta && { clientMeta: body.clientMeta }),
        ...(body.items && {
          items: {
            deleteMany: {},
            create: body.items.map((it: any) => ({
              description: it.description,
              quantity: it.quantity,
              rate: it.rate,
              tax: it.tax,
            })),
          },
        }),
      },
      include: { items: true },
    });

    return NextResponse.json({ 
      invoice: { 
        ...updatedInvoice, 
        subtotal: Number(updatedInvoice.subtotal), 
        tax: Number(updatedInvoice.tax), 
        total: Number(updatedInvoice.total) 
      } 
    });
  } catch (error) {
    console.error('[INVOICE_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
