export const pricingPlans = [
  {
    id: "price_starter_10", // Уникальный ID для Stripe
    name: "Beginner",
    baseGBP: 10,
    baseEUR: 11.50, // 10 * 1.15
    baseUSD: 13.30, // 10 * 1.33
    tokens: 1000,
    popular: false,
    cta: "Buy tokens",
    bullets: [
      "Top up 1,000 tokens (~100 invoices)",
      "No subscription",
      "Draft/preview free",
    ],
  },
  {
    id: "price_pro_50",
    name: "Pro",
    baseGBP: 50,
    baseEUR: 57.50, // 50 * 1.15
    baseUSD: 66.50, // 50 * 1.33
    tokens: 5000,
    popular: true,
    cta: "Buy tokens",
    bullets: [
      "Top up 5,000 tokens (~500 invoices)",
      "Templates & logo",
      "Payment links",
      "Read receipts",
    ],
  },
  {
    id: "price_business_100",
    name: "Business",
    baseGBP: 100,
    baseEUR: 115.00, // 100 * 1.15
    baseUSD: 133.00, // 100 * 1.33
    tokens: 10000,
    popular: false,
    cta: "Buy tokens",
    bullets: [
      "Top up 10,000 tokens (~1,000 invoices)",
      "Teams & roles",
      "Integrations (Stripe/Wise)",
      "API & webhooks",
    ],
  },
];

export type Plan = (typeof pricingPlans)[0];
export type Currency = "GBP" | "EUR" | "USD";
