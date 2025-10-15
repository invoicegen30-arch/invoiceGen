import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";

/**
 * Створення ордеру, перенаправлення на 3DS і миттєве поповнення токенів.
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
        orderSystemId: saleData.orderSystemId ?? null,
        orderMerchantId: saleData.orderMerchantId,
        status: saleData.orderState || "PROCESSING",
        response: saleData.raw,
      },
    });



    // 3️⃣ Якщо redirect є — створення успішне
    if (saleData.redirectUrl) {
      console.log("💰 Redirect отримано — нараховую токени...");

      const user = await db.user.findUnique({
        where: { email: body.email },
      });

      if (user) {
        const tokensToAdd = body.tokens ?? 0;
        const newBalance = user.tokenBalance + tokensToAdd;

        // Оновлюємо баланс користувача
        await db.user.update({
          where: { id: user.id },
          data: { tokenBalance: newBalance },
        });

        // Додаємо запис у Ledger
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

        console.log(`✅ Tokens credited: +${tokensToAdd} to ${user.email}`);
      } else {
        console.warn(`⚠️ User not found for email: ${body.email}`);
      }

      // 4️⃣ Редиректимо користувача на 3DS
      console.log("🔁 Redirecting to:", saleData.redirectUrl);
      return NextResponse.redirect(saleData.redirectUrl, 302);
    }

    // 5️⃣ Якщо redirect ще не готовий — просто повертаємо JSON
    return NextResponse.json(
      {
        success: true,
        message: "Redirect URL not ready yet, order saved",
        data: {
          orderId: order.id,
          orderMerchantId: saleData.orderMerchantId,
          orderSystemId: saleData.orderSystemId,
          status: saleData.orderState,
          redirectUrl: saleData.redirectUrl,
        },
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error("❌ CardServ sale error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
