"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentStatus {
  sp_order_id: string;
  order_id: string;
  method: string;
  bank_status: string;
  sp_code: string;
  sp_message: string;
  amount: string;
  currency: string;
  transaction_status: string;
}

export default function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      if (!searchParams) {
        setError("No search parameters found");
        setVerifying(false);
        return;
      }

      const orderId = searchParams.get("order_id");

      if (!orderId) {
        setError("No order ID found in callback");
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setPaymentStatus(result.data);
        } else {
          setError(result.error || "Verification failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setVerifying(false);
      }
    };

    verifyTransaction();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Verifying your payment...
          </p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <div className="shrink-0">
              <svg
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-red-700">Payment Error</h2>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const isSuccess =
    paymentStatus?.sp_code === "1000" ||
    paymentStatus?.bank_status?.toLowerCase() === "success";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div
        className={`max-w-md w-full p-8 bg-white rounded-lg shadow-lg border-l-4 ${
          isSuccess ? "border-green-500" : "border-yellow-500"
        }`}
      >
        <div className="flex items-center mb-6">
          <div className="shrink-0">
            {isSuccess ? (
              <svg
                className="h-12 w-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-12 w-12 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
          <div className="ml-4">
            <h2
              className={`text-2xl font-bold ${
                isSuccess ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {isSuccess ? "Payment Successful!" : "Payment Status"}
            </h2>
          </div>
        </div>

        {paymentStatus && (
          <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Order ID:</span>
              <span className="text-gray-900">{paymentStatus.order_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Amount:</span>
              <span className="text-gray-900 font-semibold">
                {paymentStatus.amount} {paymentStatus.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Status:</span>
              <span
                className={`font-semibold ${
                  isSuccess ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {paymentStatus.transaction_status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Message:</span>
              <span className="text-gray-900">{paymentStatus.sp_message}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => (window.location.href = "/")}
          className={`w-full text-white py-3 px-4 rounded-lg transition-colors font-medium ${
            isSuccess
              ? "bg-green-600 hover:bg-green-700"
              : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
