import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";

/**
 * Крон-ендпоінт: перевіряє всі PROCESSING ордери і оновлює статуси.
 * Викликати можна кожні 5 хв через cron-job.org або Render Cron.
 */
export async function GET() {
  try {
    const processingOrders = await db.order.findMany({
      where: { status: "PROCESSING" },
    });

    if (!processingOrders.length) {
      return NextResponse.json({ ok: true, message: "No orders to check." });
    }

    console.log(`🔍 Checking ${processingOrders.length} orders...`);

    const results: any[] = [];

    for (const order of processingOrders) {
      try {
        const statusData = await getCardServStatus(order.orderMerchantId!);

        // оновлюємо статус у БД
        await db.order.update({
          where: { id: order.id },
          data: {
            status: statusData.orderState,
            response: statusData.raw,
          },
        });

        // якщо оплата пройшла успішно — нараховуємо токени користувачу
        if (statusData.orderState === "APPROVED") {
          const user = await db.user.findUnique({
            where: { email: order.userEmail },
          });

          if (user) {
            const newBalance = user.tokenBalance + (order.tokens ?? 0);

            await db.user.update({
              where: { id: user.id },
              data: { tokenBalance: newBalance },
            });

            await db.ledgerEntry.create({
              data: {
                userId: user.id,
                type: "Top-up",
                delta: order.tokens ?? 0,
                balanceAfter: newBalance,
                currency: user.currency,
                amount: Math.round(order.amount * 100), // у пенсах / копійках
              },
            });

            console.log(`💰 User ${user.email} balance updated: +${order.tokens} tokens`);
          }
        }

        results.push({
          id: order.id,
          status: statusData.orderState,
        });
      } catch (err: any) {
        console.error(`❌ Error checking order ${order.id}:`, err.message);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: processingOrders.length,
      results,
    });
  } catch (err: any) {
    console.error("❌ check-orders cron error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
