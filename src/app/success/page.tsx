"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    async function verify() {
      try {
        // Trigger check-orders to pick up any APPROVED orders
        await fetch("/api/cardserv/check-orders");

        // Give a moment for webhook/check to process
        await new Promise((r) => setTimeout(r, 1500));

        setStatus("success");
        setMessage("Payment verified! Tokens have been credited to your account.");
        toast.success("✅ Payment verified successfully!");
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => router.push("/my-orders"), 4000);
      } catch {
        setStatus("failed");
        setMessage("Could not verify payment. Please check your orders page.");
        toast.error("Payment verification issue");
        setTimeout(() => router.push("/my-orders"), 4000);
      }
    }
    verify();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      {status === "loading" && (
        <>
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-slate-700">Verifying Payment…</h1>
          <p className="text-slate-500 mt-2">{message}</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-emerald-600">Payment Successful</h1>
          <p className="text-slate-500 mt-2">{message}</p>
          <p className="text-slate-400 text-sm mt-4">Redirecting to your orders…</p>
        </>
      )}
      {status === "failed" && (
        <>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-amber-600">Verification Issue</h1>
          <p className="text-slate-500 mt-2">{message}</p>
          <p className="text-slate-400 text-sm mt-4">Redirecting to your orders…</p>
        </>
      )}
    </div>
  );
}
