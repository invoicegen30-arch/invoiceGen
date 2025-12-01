import { randomUUID } from "crypto";

// ------------------------------------
// МАПА КОНФІГУРАЦІЙ ДЛЯ КОЖНОЇ ВАЛЮТИ
// ------------------------------------

const CARD_SERV_CONFIG: Record<
  string,
  { REQUESTOR_ID: string; TOKEN: string; CURRENCY: string }
> = {
  GBP: {
    REQUESTOR_ID: process.env.CARDSERV_REQUESTOR_ID_GBP!,
    TOKEN: process.env.CARDSERV_BEARER_TOKEN_GBP!,
    CURRENCY: "GBP",
  },
  EUR: {
    REQUESTOR_ID: process.env.CARDSERV_REQUESTOR_ID_EUR!,
    TOKEN: process.env.CARDSERV_BEARER_TOKEN_EUR!,
    CURRENCY: "EUR",
  },
  USD: {
    REQUESTOR_ID: process.env.CARDSERV_REQUESTOR_ID_USD!,
    TOKEN: process.env.CARDSERV_BEARER_TOKEN_USD!,
    CURRENCY: "USD",
  },
};

// Якщо валюта не передана — беремо GBP як дефолт
function getCfg(currency?: string) {
  return CARD_SERV_CONFIG[currency ?? "GBP"];
}

// ------------------------------------
// ФУНКЦІЯ ОЧІКУВАННЯ
// ------------------------------------
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------------------
// STATUS (ПОВЕРТАЄ 3DS REDIRECT URL)
// ------------------------------------
export async function getCardServStatus(
  orderMerchantId: string,
  currency: string = "GBP"
) {
  const { REQUESTOR_ID, TOKEN } = getCfg(currency);

  const baseUrl =
    process.env.CARDSERV_BASE_URL?.replace(/\/+$/, "") ||
    "https://test.cardserv.io";

  const url = `${baseUrl}/api/payments/status/${REQUESTOR_ID}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderMerchantId }),
  });

  const text = await res.text();
  let data: any = {};

  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ Non-JSON STATUS:", text.slice(0, 200));
  }

  return {
    ok: res.ok,
    statusCode: res.status,
    orderState: data.orderState ?? "PROCESSING",
    orderSystemId: data.orderSystemId ?? null,
    redirectUrl: data.outputRedirectToUrl ?? null,
    raw: data,
  };
}

// ------------------------------------
// SALE (СТВОРЕННЯ ОПЛАТИ + 3DS)
// ------------------------------------
export async function createCardServOrder(payload: any) {
  const merchantOrderId = randomUUID();

  const cfg = getCfg(payload.currency);
  const { REQUESTOR_ID, TOKEN, CURRENCY } = cfg;

  const baseUrl =
    process.env.CARDSERV_BASE_URL?.replace(/\/+$/, "") ||
    "https://test.cardserv.io";

  const url = `${baseUrl}/api/payments/sale/${REQUESTOR_ID}`;

  const body = {
    order: {
      orderMerchantId: merchantOrderId,
      orderDescription: payload.description || `Top-up`,
      orderAmount: Number(payload.amount).toFixed(2),
      orderCurrencyCode: CURRENCY,
    },
    browser: {
      ipAddress: payload.ip || "8.8.8.8",
      acceptHeader: "*/*",
      colorDepth: 32,
      javascriptEnabled: "true",
      acceptLanguage: "en-US",
      screenHeight: 1080,
      screenWidth: 1920,
      timeZone: -180,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome Safari",
      javaEnabled: "false",
    },
    customer: {
      firstname: (payload.card?.name ?? "John Doe").split(" ")[0],
      lastname: (payload.card?.name ?? "John Doe").split(" ")[1] ?? "Doe",
      customerEmail: payload.email,
      address: {
        countryCode: "GB",
        zipCode: payload.card?.postalCode || "00000",
        city: payload.card?.city || "London",
        line1: payload.card?.address || "Unknown street",
      },
    },
    card: {
      cardNumber: payload.card.cardNumber.replace(/\s/g, ""),
      cvv2: payload.card.cvv,
      expireMonth: payload.card.expiry.split("/")[0],
      expireYear: `20${payload.card.expiry.split("/")[1]}`,
      cardPrintedName: payload.card.name,
    },
    urls: {
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/cardserv/webhook`,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const txt = await res.text();
  let saleRes = {};
  try {
    saleRes = JSON.parse(txt);
  } catch {}

  // чекати генерацію 3DS
  await wait(1500);

  let status = await getCardServStatus(merchantOrderId, payload.currency);

  if (!status.redirectUrl) {
    await wait(2000);
    status = await getCardServStatus(merchantOrderId, payload.currency);
  }

  return {
    ok: res.ok,
    orderMerchantId,
    orderSystemId: status.orderSystemId,
    orderState: status.orderState,
    redirectUrl: status.redirectUrl,
    raw: {
      sale: saleRes,
      status,
    },
  };
}
