import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";

/**
 * 💳 Простий “костиль”:
 * - створює ордер у CardServ
 * - миттєво нараховує токени користувачу
 * - редіректить на 3DS (якщо є)
 * - зберігає все у БД
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Створюємо ордер у CardServ
    const saleData = await createCardServOrder(body);

    // 2️⃣ Зберігаємо ордер у базу
    const order = await db.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens || null,
        orderSystemId: saleData.orderSystemId?.toString() ?? null,
        orderMerchantId: saleData.orderMerchantId,
        status: saleData.orderState || "PROCESSING",
        response: saleData.raw,
      },
    });

    // 3️⃣ Одразу (костильно) нараховуємо токени незалежно від статусу
    const user = await db.user.findUnique({
      where: { email: body.email },
    });

    if (user) {
      const tokensToAdd = body.tokens ?? 0;
      const newBalance = user.tokenBalance + tokensToAdd;

      await db.user.update({
        where: { id: user.id },
        data: { tokenBalance: newBalance },
      });

      await db.ledgerEntry.create({
        data: {
          userId: user.id,
          type: "Top-up",
          delta: tokensToAdd,
          balanceAfter: newBalance,
          currency: user.currency,
          amount: Math.round(body.amount * 100),
        },
      });

      console.log(`✅ [INSTANT] Tokens credited: +${tokensToAdd} → ${user.email}`);
    } else {
      console.warn(`⚠️ User not found for email: ${body.email}`);
    }

    // 4️⃣ Якщо redirect є → редіректимо
    if (saleData.redirectUrl) {
      console.log("🔁 Sending redirect URL:", saleData.redirectUrl);

      return NextResponse.json(
        {
          success: true,
          redirectUrl: saleData.redirectUrl,
          data: {
            orderMerchantId: saleData.orderMerchantId,
            orderSystemId: saleData.orderSystemId,
          },
        },
        { status: 200 }
      );
    }


    // 5️⃣ Якщо redirect ще не готовий → просто повертаємо JSON
    return NextResponse.json(
      {
        success: true,
        message: "Tokens credited instantly and order saved.",
        data: {
          orderId: order.id,
          orderMerchantId: saleData.orderMerchantId,
          orderSystemId: saleData.orderSystemId,
          status: saleData.orderState,
          redirectUrl: saleData.redirectUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ CardServ sale error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
