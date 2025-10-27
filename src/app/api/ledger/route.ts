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
  const ledger = await prisma.ledgerEntry.findMany({ where: { userId }, orderBy: { ts: 'desc' } });
  return NextResponse.json({ ledger });
}

// POST supports Top-up and Adjust
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const body = await req.json().catch(() => ({}));
  const type = (body.type as string) || 'Top-up';
  const amount = Number(body.amount ?? 0);
  const currency = (body.currency as 'GBP' | 'EUR' | 'USD') || ((session.user as any).currency ?? 'GBP');

  if (type === 'Top-up' && !amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const delta = type === 'Top-up' ? amount * 100 : Number(body.delta ?? 0);
    const newBalance = user.tokenBalance + delta;
    await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        type,
        delta,
        balanceAfter: newBalance,
        currency,
        amount: type === 'Top-up' ? amount : null,
        receiptUrl: body.receiptUrl || null,
      },
    });
    return NextResponse.json({ entry, tokenBalance: newBalance });
  });
}
