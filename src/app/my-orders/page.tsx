"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type Order = {
  id: string;
  amount: number;
  currency: string;
  tokens: number | null;
  description?: string;
  status: string;
  createdAt: string;
  orderSystemId?: number | null;
  orderMerchantId?: string | null;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "DECLINED":
      case "FAILED":
        return "bg-rose-100 text-rose-700 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
          My Orders
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-slate-600 py-16">
            <p className="text-lg font-medium">You haven’t made any orders yet.</p>
            <p className="text-sm text-slate-500 mt-1">
              Your purchases will appear here once created.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {order.description || "Token Purchase"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                    </p>

                    {/* 🔹 Order IDs */}
                    <div className="mt-2 text-xs text-slate-500 space-y-1">

                      {order.orderSystemId && (
                        <p>
                          <span className="font-semibold text-slate-600">
                            Order ID:
                          </span>{" "}
                          {order.orderSystemId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div
                      className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">
                        {order.amount.toFixed(2)} {order.currency}
                      </p>
                      {order.tokens && (
                        <p className="text-sm text-slate-500">
                          {order.tokens} tokens
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
