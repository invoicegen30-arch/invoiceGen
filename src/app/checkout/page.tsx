"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [checkout, setCheckout] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("checkoutData");
    if (!data) router.push("/pricing");
    else setCheckout(JSON.parse(data));
  }, [router]);

  if (!checkout) return null;

  const vatRate = 0.2;
  const subtotal = checkout.amount;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, "Card number must be 16 digits")
      .required("Card number is required"),
    expiry: Yup.string()
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format must be MM/YY")
      .required("Expiry date is required"),
    cvv: Yup.string()
      .matches(/^\d{3}$/, "CVV must be 3 digits")
      .required("CVV is required"),
    name: Yup.string().required("Cardholder name is required"),
    address: Yup.string().required("Billing address is required"),
    city: Yup.string().required("City is required"),
    postalCode: Yup.string().required("Postal code is required"),
    acceptedTerms: Yup.boolean()
      .oneOf([true], "You must accept the Terms & Conditions")
      .required("You must accept the Terms & Conditions"),
  });

  const handleCardNumberFormat = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  const handleExpiryFormat = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!values.acceptedTerms) {
      toast.error("You must accept the Terms & Conditions.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/cardserv/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...checkout, card: values, tokens: checkout.tokens }),
      });

      const sale = await res.json();

      if (!res.ok) throw new Error(sale.error || "Payment creation failed");


      /* =============================
         1) IMMEDIATE REDIRECT
      ============================== */

      const immediateRedirect =
        sale?.data?.redirectUrl ||
        sale?.redirectUrl ||
        sale?.raw?.status?.redirectUrl;

      if (immediateRedirect) {
        window.location.href = immediateRedirect;
        return;
      }


      /* =============================
         2) WAIT FOR REDIRECT VIA STATUS
      ============================== */

      let redirectUrl = null;
      let attempts = 0;

      while (!redirectUrl && attempts < 6) {
        await new Promise((r) => setTimeout(r, 2000));

        const check = await fetch("/api/cardserv/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderMerchantId: sale.data.orderMerchantId,
            orderSystemId: sale.data.orderSystemId,
            currency: checkout.currency,
          }),
        });

        const status = await check.json();

        redirectUrl =
          status?.data?.redirectUrl ||
          status?.redirectUrl ||
          status?.raw?.redirectUrl;

        attempts++;
      }

      if (sale.redirectUrl) {
        window.location.href = sale.redirectUrl;
        return;
      }


      /* =============================
         3) NO REDIRECT → SUCCESS UI
      ============================== */
      toast.success("Order created successfully!");
      setSuccess(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => router.push("/my-orders"), 4000);

    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-8 py-6 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <h1 className="text-2xl font-semibold">
            {success ? "Thank You!" : "Checkout"}
          </h1>
          {!success && <p className="text-sm opacity-90">Secure Payment</p>}
        </div>

        <div className="p-8">
          {/* ✅ Success Message */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <h2 className="text-3xl font-bold text-indigo-700 mb-4">
                Your order has been created successfully!
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Once your payment is confirmed by our manager, tokens will be credited
                to your account balance automatically. You can track your order status in your dashboard.
              </p>
            </motion.div>
          ) : (
            // 💳 Payment Form + Summary
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Summary */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-slate-800">
                  Order Summary
                </h2>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-slate-800">
                        {checkout.planId
                          ? checkout.planId.replace("price_", "")
                          : "Custom top-up"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {checkout.description}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {checkout.amount} {checkout.currency}
                    </p>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-700">
                      {subtotal.toFixed(2)} {checkout.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">VAT (20%)</span>
                    <span className="font-medium text-slate-700">
                      {vatAmount.toFixed(2)} {checkout.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-3">
                    <span>Total</span>
                    <span>
                      {total.toFixed(2)} {checkout.currency}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-slate-500 leading-relaxed">
                  <p>
                    You are purchasing <strong>{checkout.description}</strong>.
                  </p>
                  <p className="mt-2">
                    A detailed invoice will be emailed to{" "}
                    <strong>{checkout.email}</strong>.
                  </p>
                </div>

                {/* Policy Links */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-xs text-slate-600 space-y-2">
                    <div>
                      <Link href="/privacy" className="hover:underline text-indigo-600">
                        Privacy Policy
                      </Link>
                    </div>
                    <div>
                      <Link href="/cookies" className="hover:underline text-indigo-600">
                        Cookie Policy
                      </Link>
                    </div>
                    <div>
                      <Link href="/refund" className="hover:underline text-indigo-600">
                        Refund Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-slate-800">
                  Payment Details
                </h2>

                <Formik
                  initialValues={{
                    cardNumber: "",
                    expiry: "",
                    cvv: "",
                    name: "",
                    address: "",
                    city: "",
                    postalCode: "",
                    acceptedTerms: false,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-4">
                      <div>
                        <Field
                          name="cardNumber"
                          placeholder="Card number"
                          value={values.cardNumber}
                          onChange={(e: any) =>
                            setFieldValue(
                              "cardNumber",
                              handleCardNumberFormat(e.target.value)
                            )
                          }
                          className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                        />
                        <ErrorMessage
                          name="cardNumber"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="flex gap-3">
                        <div className="w-1/2">
                          <Field
                            name="expiry"
                            placeholder="MM/YY"
                            value={values.expiry}
                            onChange={(e: any) =>
                              setFieldValue(
                                "expiry",
                                handleExpiryFormat(e.target.value)
                              )
                            }
                            className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                          />
                          <ErrorMessage
                            name="expiry"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="w-1/2">
                          <Field
                            name="cvv"
                            placeholder="CVV"
                            value={values.cvv}
                            onChange={(e: any) =>
                              setFieldValue(
                                "cvv",
                                e.target.value.replace(/\D/g, "").slice(0, 3)
                              )
                            }
                            className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                          />
                          <ErrorMessage
                            name="cvv"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <Field
                        name="name"
                        placeholder="Cardholder name"
                        className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />

                      <Field
                        name="address"
                        placeholder="Billing address"
                        className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />

                      <div className="flex gap-3">
                        <div className="w-2/3">
                          <Field
                            name="city"
                            placeholder="City"
                            className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                          />
                          <ErrorMessage
                            name="city"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="w-1/3">
                          <Field
                            name="postalCode"
                            placeholder="Postal code"
                            className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                          />
                          <ErrorMessage
                            name="postalCode"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      {/* Terms & Conditions Checkbox */}
                      <div className="mt-6">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="acceptedTerms"
                            className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">
                            I accept the{" "}
                            <Link
                              href="/terms"
                              className="text-indigo-600 hover:underline font-medium"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Terms & Conditions
                            </Link>
                          </span>
                        </label>
                        <ErrorMessage
                          name="acceptedTerms"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <Button
                        className="w-full mt-6 flex items-center justify-center gap-2"
                        size="lg"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Pay {total.toFixed(2)} {checkout.currency}</>
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
