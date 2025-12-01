import { randomUUID } from "crypto";

/*==============================================
=            CONFIG FOR EACH CURRENCY
==============================================*/

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

function getCfg(currency?: string) {
  return CARD_SERV_CONFIG[currency ?? "GBP"];
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*==============================================
=     COUNTRY CODE MAP (VERY IMPORTANT)
==============================================*/

const mapCountry: Record<string, string> = {
  GBP: "GB",
  EUR: "DE",
  USD: "US",
};

/*==============================================
=                 STATUS CHECK
==============================================*/

export async function getCardServStatus(
  orderMerchantId: string,
  orderSystemId?: string,
  currency = "GBP"
) {
  const { REQUESTOR_ID, TOKEN } = getCfg(currency);

  const baseUrl =
    process.env.CARDSERV_BASE_URL?.replace(/\/+$/, "") ||
    "https://test.cardserv.io";

  const url = `${baseUrl}/api/payments/status/${REQUESTOR_ID}`;

  console.log("🟧 STATUS → REQUEST:", {
    url,
    orderMerchantId,
    orderSystemId,
    currency,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderMerchantId,
      orderSystemId: orderSystemId ?? undefined,
    }),
  });

  const text = await res.text();
  console.log("🟥 STATUS RAW RESPONSE:", text);

  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {}

  const redirectUrl =
    data?.redirectData?.redirectUrl ||
    data?.redirectData?.threeDSRedirectUrl ||
    data?.outputRedirectToUrl ||
    null;

  return {
    ok: res.ok,
    orderMerchantId,
    orderSystemId: data.orderSystemId ?? orderSystemId,
    orderState: data.orderState ?? "PROCESSING",
    redirectUrl,
    raw: data,
  };
}


/*==============================================
=               CREATE SALE ORDER
==============================================*/

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
      orderDescription: payload.description || "Top-up",
      orderAmount: Number(payload.amount).toFixed(2),
      orderCurrencyCode: CURRENCY,
      challengeIndicator: "04",
    },
    browser: {
      ipAddress: payload.ip || "8.8.8.8",
      acceptHeader:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      colorDepth: 32,
      javascriptEnabled: "true",

      // must be ≤8 chars
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
        countryCode: mapCountry[CURRENCY] ?? "GB",
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

  console.log("🟦 SALE → REQUEST:", { url, body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const txt = await res.text();
  console.log("🟩 SALE RAW RESPONSE:", txt);

  let saleRes: any = {};
  try {
    saleRes = JSON.parse(txt);
  } catch {}

  const returnedMerchantId =
    saleRes?.order?.orderMerchantId || merchantOrderId;

  const orderSystemId = saleRes?.orderSystemId || saleRes?.order?.orderSystemId;

  console.log("🟩 MERCHANT ORDER ID USED:", returnedMerchantId);
  console.log("🟩 ORDER SYSTEM ID:", orderSystemId);

  // wait for redirect to generate
  await wait(1500);

  let status = await getCardServStatus(
    returnedMerchantId,
    orderSystemId,
    payload.currency
  );

  if (!status.redirectUrl) {
    console.log("⌛ Waiting more for redirect...");
    await wait(2000);
    status = await getCardServStatus(
      returnedMerchantId,
      orderSystemId,
      payload.currency
    );
  }

  return {
    ok: res.ok,
    orderMerchantId: returnedMerchantId,
    orderSystemId: status.orderSystemId,
    orderState: status.orderState,
    redirectUrl: status.redirectUrl,
    raw: { sale: saleRes, status },
  };
}
