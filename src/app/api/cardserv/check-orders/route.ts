import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const {
      CARDSERV_BASE_URL,
      CARDSERV_REQUESTOR_ID,
      CARDSERV_BEARER_TOKEN,
    } = process.env;

    const baseUrl = CARDSERV_BASE_URL?.replace(/\/+$/, "") || "https://test.cardserv.io/api";
    const statusUrl = `${baseUrl}/payments/status/${CARDSERV_REQUESTOR_ID}`;

    // 1️⃣ Знайти всі PROCESSING ордери
    const orders = await db.order.findMany({
      where: { status: "PROCESSING" },
    });

    if (!orders.length) {
      return NextResponse.json({ message: "No pending orders." });
    }

    const updatedOrders: any[] = [];

    for (const order of orders) {
      try {
        // 2️⃣ Запит до CardServ
        const res = await fetch(statusUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CARDSERV_BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderSystemId: order.orderSystemId,
            orderMerchantId: order.orderMerchantId,
          }),
        });

        const raw = await res.text();
        let data: any;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { raw };
        }

        const newStatus = data.orderState || "UNKNOWN";

        // 3️⃣ Оновити статус ордеру у БД
        const updated = await db.order.update({
          where: { id: order.id },
          data: {
            status: newStatus,
            response: data,
          },
        });

        updatedOrders.push(updated);

        // 4️⃣ Якщо ордер підтверджено → зараховуємо токени
        if (newStatus === "APPROVED") {
          const user = await db.user.findUnique({
            where: { email: order.userEmail },
          });

          if (user) {
            const newBalance = user.tokenBalance + (order.tokens || 0);

            await db.user.update({
              where: { id: user.id },
              data: { tokenBalance: newBalance },
            });

            // 5️⃣ Створити запис у Ledger (історія)
            await db.ledgerEntry.create({
              data: {
                userId: user.id,
                type: "Top-up",
                delta: order.tokens || 0,
                balanceAfter: newBalance,
                currency: order.currency as any,
                amount: order.amount,
              },
            });
          }
        }
      } catch (err) {
        console.error(`Error checking order ${order.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      checked: orders.length,
      updated: updatedOrders.length,
      details: updatedOrders.map((o) => ({
        id: o.id,
        email: o.userEmail,
        status: o.status,
      })),
    });
  } catch (error: any) {
    console.error("Check orders error:", error);
    return NextResponse.json(
      { error: error.message || "Check orders failed" },
      { status: 500 }
    );
  }
}
