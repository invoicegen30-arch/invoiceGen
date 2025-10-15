import { randomUUID } from "crypto";

// Допоміжна функція для затримки
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Отримати статус ордеру з CardServ (включно з 3DS redirect URL)
 */
export async function getCardServStatus(orderMerchantId: string) {
  const {
    CARDSERV_BASE_URL,
    CARDSERV_REQUESTOR_ID,
    CARDSERV_BEARER_TOKEN,
  } = process.env;

  const baseUrl = CARDSERV_BASE_URL?.replace(/\/+$/, "") || "https://test.cardserv.io";
  const url = `${baseUrl}/api/payments/status/${CARDSERV_REQUESTOR_ID}`; // ✅ правильний endpoint

  const headers = {
    Authorization: `Bearer ${CARDSERV_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ orderMerchantId }),
  });

  const text = await res.text();
  let data: any = {};

  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ CardServ status returned non-JSON:", text.slice(0, 150));
  }

  console.log("✅ CardServ STATUS:", data);

  return {
    ok: res.ok,
    statusCode: res.status,
    orderSystemId: data.orderSystemId ? String(data.orderSystemId) : null,
    orderState: data.orderState ?? "PROCESSING",
    redirectUrl: data.outputRedirectToUrl ?? null,
    raw: data,
  };
}

/**
 * Створення платежу (sale) + отримання статусу з redirect URL
 */
export async function createCardServOrder(payload: any) {
  const {
    CARDSERV_BASE_URL,
    CARDSERV_REQUESTOR_ID,
    CARDSERV_BEARER_TOKEN,
    CARDSERV_CURRENCY,
  } = process.env;

  const merchantOrderId = randomUUID();

  const baseUrl = CARDSERV_BASE_URL?.replace(/\/+$/, "") || "https://test.cardserv.io";
  const url = `${baseUrl}/api/payments/sale/${CARDSERV_REQUESTOR_ID}`;

  const headers = {
    Authorization: `Bearer ${CARDSERV_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = {
    order: {
      orderMerchantId: merchantOrderId,
      orderDescription: payload.description || `Top-up #${Date.now()}`,
      orderAmount: (payload.amount ?? 1).toFixed(2),
      orderCurrencyCode: CARDSERV_CURRENCY || "EUR",
    },
    browser: {
      ipAddress: "2.58.95.68",
      acceptHeader:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      colorDepth: 32,
      javascriptEnabled: "true",
      acceptLanguage: "en-US",
      screenHeight: 1080,
      screenWidth: 1920,
      timeZone: -180,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      javaEnabled: "false",
    },
    customer: {
      firstname: payload.card?.name?.split(" ")[0] || "John",
      lastname: payload.card?.name?.split(" ")[1] || "Doe",
      customerEmail: payload.email || "test@example.com",
      address: {
        countryCode: "GB",
        zipCode: payload.card?.postalCode || "00000",
        city: payload.card?.city || "London",
        line1: payload.card?.address || "123 Baker Street",
      },
    },
    card: {
      cardNumber: payload.card?.cardNumber || "4444444444444422",
      cvv2: payload.card?.cvv || "123",
      expireMonth: payload.card?.expiry?.split("/")[0] || "10",
      expireYear: `20${payload.card?.expiry?.split("/")[1] || "26"}`,
      cardPrintedName:
        (payload.card?.name && payload.card?.name.trim().length >= 2
          ? payload.card.name.trim()
          : "John Doe"),
    },
    urls: {
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/cardserv/webhook`,
    },
  };

  // 🔹 1. Надсилаємо запит на створення транзакції (SALE)
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ CardServ returned non-JSON:", text.slice(0, 150));
  }

  // 🔹 2. Чекаємо, поки транзакція створиться
  await wait(1500);

  // 🔹 3. Робимо STATUS-запит, щоб отримати redirect URL для 3DS
  let statusData = await getCardServStatus(merchantOrderId);

  // 🔁 Повторна спроба, якщо redirect ще не згенерувався
  if (!statusData.redirectUrl) {
    await wait(2000);
    statusData = await getCardServStatus(merchantOrderId);
  }

  return {
    ok: res.ok,
    statusCode: res.status,
    orderSystemId: statusData.orderSystemId ?? data.orderSystemId ?? null,
    orderMerchantId: merchantOrderId,
    orderState: statusData.orderState ?? "PROCESSING",
    redirectUrl: statusData.redirectUrl ?? null,
    raw: { sale: data, status: statusData },
  };
}
