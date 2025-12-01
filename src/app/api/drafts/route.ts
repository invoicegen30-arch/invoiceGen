import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Currency } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Дозволені валюти (string union, а не Prisma enum)
const allowedCurrencies = ["GBP", "EUR", "USD"] as const;
type AllowedCurrency = (typeof allowedCurrencies)[number];

// Валідатор валюти — повертає string union
function safeCurrency(input: any): AllowedCurrency {
  if (typeof input === "string" && allowedCurrencies.includes(input as any)) {
    return input as AllowedCurrency;
  }
  return "GBP"; // fallback
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const body = await req.json().catch(() => ({}));

  // STEP 1 — беремо валюту з body → fallback session → fallback GBP
  const rawCurrency = safeCurrency(body.currency || (session.user as any).currency);

  // STEP 2 — конвертуємо union string → Prisma enum (цей костиль ідеально працює)
  const currency = rawCurrency as unknown as Currency;

  const client = (body.client as string) || 'New Client';

  const toDec = (v: any) =>
    typeof v === "number" ? v.toFixed(2) : (Number(v || 0)).toFixed(2);

  const subtotal = toDec(body.subtotal ?? 0);
  const tax = toDec(body.tax ?? 0);
  const total = toDec(body.total ?? (Number(body.subtotal ?? 0) + Number(body.tax ?? 0)));

  const items = Array.isArray(body.items)
    ? (body.items as Array<{
      description: string;
      quantity: number;
      rate: number;
      tax: number;
    }>)
    : [];

  const clientMeta =
    body.clientMeta && typeof body.clientMeta === "object"
      ? body.clientMeta
      : undefined;

  const dueIso =
    typeof body.due === "string" && body.due ? new Date(body.due) : null;

  // Generate invoice number
  const last = await prisma.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const nextNum =
    (last?.number &&
      parseInt(last.number.split("-").pop() || "0", 10) + 1) ||
    245;

  const number = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(
    6,
    "0"
  )}`;

  // CREATE INVOICE
  const invoice = await prisma.invoice.create({
    data: {
      userId,
      number,
      date: new Date(),
      due: dueIso || undefined,
      client,
      currency, // <-- Повністю валідно для Prisma
      subtotal,
      tax,
      total,
      status: "Draft",
      clientMeta: clientMeta as any,
      items: items.length
        ? {
          create: items.map((it) => ({
            description: it.description,
            quantity: Math.round(it.quantity || 0),
            rate: toDec(it.rate || 0),
            tax: Math.round(it.tax || 0),
          })),
        }
        : undefined,
    },
    include: { items: true },
  });

  return NextResponse.json({ invoice });
}
