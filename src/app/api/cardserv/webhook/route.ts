// TypeScript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // adapt to the actual structure your gateway sends
    const orderSystemId = body?.order?.orderSystemId ?? body?.orderSystemId ?? body?.orderId;

    if (typeof orderSystemId !== 'string' || !orderSystemId.trim()) {
      return NextResponse.json({ error: 'Invalid or missing orderSystemId' }, { status: 400 });
    }

    // Use findFirst when the lookup field is not the Prisma unique `id`.
    const order = await db.order.findFirst({ where: { orderSystemId } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // handle webhook event and update order as needed (example)
    // const eventType = body?.event;
    // if (eventType === 'PAYMENT.SUCCESS') { ... update order ... }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CardServ webhook error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
