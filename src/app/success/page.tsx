"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success("✅ Payment verified successfully!");
    setTimeout(() => router.push("/my-orders"), 3000);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl font-bold text-emerald-600">Payment Successful</h1>
      <p className="text-slate-500 mt-2">
        Redirecting you to your orders...
      </p>
    </div>
  );
}
