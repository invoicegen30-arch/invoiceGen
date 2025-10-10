import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const invoices = await prisma.invoice.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  const normalized = invoices.map((inv: any) => ({ ...inv, subtotal: Number(inv.subtotal), tax: Number(inv.tax), total: Number(inv.total) }));
  return NextResponse.json({ invoices: normalized });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => ({}));
  const currency = (body.currency as 'GBP' | 'EUR') || ((session.user as any).currency ?? 'GBP');
  const client = (body.client as string) || 'New Client';
  const toDec = (v: any) => typeof v === 'number' ? v.toFixed(2) : (Number(v||0)).toFixed(2);
  const subtotal = toDec(body.subtotal ?? 100);
  const tax = toDec(body.tax ?? 20);
  const total = toDec(body.total ?? (Number(body.subtotal ?? 100) + Number(body.tax ?? 20)));
  const dueIso = typeof body.due === 'string' && body.due ? new Date(body.due) : null;
  const items = Array.isArray(body.items) ? body.items as Array<{ description: string; quantity: number; rate: number; tax: number }> : [];
  const clientMeta = body.clientMeta && typeof body.clientMeta === 'object' ? body.clientMeta : undefined;

  // Charge 10 tokens per created invoice
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.tokenBalance < 10) return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });

    const last = await tx.invoice.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    const nextNum = (last?.number && parseInt(last.number.split('-').pop() || '0', 10) + 1) || 245;
    const number = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(6, '0')}`;

    const invoice = await tx.invoice.create({
      data: {
        userId,
        number,
        date: new Date(),
        due: dueIso || undefined,
        client,
        currency,
        subtotal,
        tax,
        total,
        status: 'Ready',
        clientMeta: clientMeta as any,
        items: items.length ? { create: items.map(it => ({ description: it.description, quantity: Math.round(it.quantity||0), rate: toDec(it.rate||0), tax: Math.round(it.tax||0) })) } : undefined,
      },
      include: { items: true },
    });

    const newBalance = user.tokenBalance - 10;
    await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
    await tx.ledgerEntry.create({
      data: {
        userId,
        type: 'Invoice',
        delta: -10,
        balanceAfter: newBalance,
      },
    });

    return NextResponse.json({ invoice: { ...invoice, subtotal: Number(invoice.subtotal), tax: Number(invoice.tax), total: Number(invoice.total) }, tokenBalance: newBalance });
  });
}
