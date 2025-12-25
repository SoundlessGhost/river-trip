"use client";

import { useState } from "react";
import type { MakePaymentResponse } from "shurjopay-js";

interface PaymentFormData {
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
}

export default function PaymentForm() {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 100,
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    customer_city: "Dhaka",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const paymentData: MakePaymentResponse = result.data;
        // Redirect to shurjoPay checkout
        window.location.href = paymentData.checkout_url;
      } else {
        setError(result.error || "Payment initiation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Payment Details</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-1 font-medium">Amount (BDT)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="10"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Customer Name</label>
        <input
          type="text"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          name="customer_email"
          value={formData.customer_email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Phone</label>
        <input
          type="tel"
          name="customer_phone"
          value={formData.customer_phone}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Address</label>
        <input
          type="text"
          name="customer_address"
          value={formData.customer_address}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">City</label>
        <input
          type="text"
          name="customer_city"
          value={formData.customer_city}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
