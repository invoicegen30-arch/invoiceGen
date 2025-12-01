import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Currency } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Allowed currencies (string union)
const allowedCurrencies = ["GBP", "EUR", "USD"] as const;
type AllowedCurrency = (typeof allowedCurrencies)[number];

// String → validated union
function safeCurrency(input: any): AllowedCurrency {
  if (typeof input === 'string' && allowedCurrencies.includes(input as any)) {
    return input as AllowedCurrency;
  }
  return "GBP";
}

// Union → Prisma enum
function toPrismaCurrency(c: AllowedCurrency): Currency {
  return c as unknown as Currency;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const ledger = await prisma.ledgerEntry.findMany({
    where: { userId },
    orderBy: { ts: 'desc' }
  });

  return NextResponse.json({ ledger });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const body = await req.json().catch(() => ({}));

  const type = (body.type as string) || 'Top-up';
  const amount = Number(body.amount ?? 0);

  // Step 1: raw currency from body OR user settings
  const rawCurrency = safeCurrency(body.currency || (session.user as any).currency);

  // Step 2: convert to Prisma enum Currency
  const currency = toPrismaCurrency(rawCurrency);

  if (type === 'Top-up' && !amount)
    return NextResponse.json({ error: 'Amount required' }, { status: 400 });

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true }
    });

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const delta =
      type === 'Top-up'
        ? amount * 100
        : Number(body.delta ?? 0);

    const newBalance = user.tokenBalance + delta;

    await tx.user.update({
      where: { id: userId },
      data: { tokenBalance: newBalance }
    });

    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        type,
        delta,
        balanceAfter: newBalance,
        currency, // ← тепер це Prisma enum
        amount: type === 'Top-up' ? amount : null,
        receiptUrl: body.receiptUrl || null
      }
    });

    return NextResponse.json({
      entry,
      tokenBalance: newBalance
    });
  });
}
