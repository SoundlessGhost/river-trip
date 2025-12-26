interface ShurjopayConfig {
  endpoint: string;
  username: string;
  password: string;
  prefix: string;
  returnUrl: string;
}

interface PaymentRequest {
  amount: number;
  order_id: string;
  currency: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_phone: string;
  customer_email: string;
  customer_state?: string;
  customer_postcode?: string;
  discount_amount?: number;
  disc_percent?: number;
}

interface PaymentResponse {
  checkout_url: string;
  amount: string;
  currency: string;
  sp_order_id: string;
  customer_order_id: string;
  customer_name: string;
  customer_address: string;
  customer_city: string;
  customer_phone: string;
  customer_email: string;
  token: string;
  store_id: string;
}

interface VerifyPaymentResponse {
  sp_order_id: string;
  order_id: string;
  method: string;
  bank_status: string;
  sp_code: string;
  sp_message: string;
  amount: string;
  currency: string;
  transaction_status: string;
  bank_trx_id?: string;
  received_amount?: string;
}

interface AuthResponse {
  token: string;
  store_id: number;
  execute_url: string;
  token_type: string;
  sp_code: string;
  message: string;
  token_create_time: string;
  expires_in: number;
}

class ShurjoPay {
  private config: ShurjopayConfig;
  private token: string | null = null;
  private storeId: number | null = null;

  constructor() {
    this.config = {
      endpoint:
        process.env.NEXT_PUBLIC_SP_ENDPOINT ||
        "https://sandbox.shurjopayment.com",
      username: process.env.SP_USERNAME || "sp_sandbox",
      password: process.env.SP_PASSWORD || "pyyk97hu&6u6",
      prefix: process.env.NEXT_PUBLIC_SP_PREFIX || "sp",
      returnUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/payment/callback`,
    };
  }

  private async authenticate(): Promise<AuthResponse> {
    try {
      console.log("🔐 Authenticating with shurjoPay...");

      const response = await fetch(`${this.config.endpoint}/api/get_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
        }),
      });

      const data: AuthResponse = await response.json();
      console.log("✅ Authentication response:", data);

      if (!response.ok) {
        throw new Error(`Authentication failed: ${JSON.stringify(data)}`);
      }

      if (!data.token || !data.store_id) {
        throw new Error("Token or store_id not received from authentication");
      }

      this.token = data.token;
      this.storeId = data.store_id;

      return data;
    } catch (error) {
      console.error("❌ Authentication error:", error);
      throw error;
    }
  }

  async makePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log("💳 Initiating payment...");

      // Get authentication token and store_id
      const authData = await this.authenticate();

      // Prepare payment data
      const paymentData = {
        prefix: this.config.prefix,
        token: authData.token,
        store_id: authData.store_id, // Use number from auth response
        return_url: this.config.returnUrl,
        cancel_url: this.config.returnUrl,
        amount: paymentRequest.amount,
        order_id: paymentRequest.order_id,
        currency: paymentRequest.currency, // Add currency field
        discsount_amount: paymentRequest.discount_amount || 0,
        disc_percent: paymentRequest.disc_percent || 0,
        client_ip: "127.0.0.1",
        customer_name: paymentRequest.customer_name,
        customer_phone: paymentRequest.customer_phone,
        customer_email: paymentRequest.customer_email,
        customer_address: paymentRequest.customer_address,
        customer_city: paymentRequest.customer_city,
        customer_state: paymentRequest.customer_state || "",
        customer_postcode: paymentRequest.customer_postcode || "",
        customer_country: "Bangladesh",
        shipping_address: paymentRequest.customer_address,
        shipping_city: paymentRequest.customer_city,
        shipping_country: "Bangladesh",
        received_person_name: paymentRequest.customer_name,
        shipping_phone_number: paymentRequest.customer_phone,
        value1: "",
        value2: "",
        value3: "",
        value4: "",
      };

      // console.log("📤 Payment request data:", {
      //   ...paymentData,
      //   token: "***hidden***",
      // });

      // Make payment request
      const response = await fetch(`${this.config.endpoint}/api/secret-pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      // console.log("📥 Payment response:", data);

      if (!response.ok) {
        throw new Error(`Payment initiation failed: ${JSON.stringify(data)}`);
      }

      if (!data.checkout_url) {
        console.error("❌ Full response data:", data);
        throw new Error(
          `Checkout URL not received. Response: ${JSON.stringify(data)}`
        );
      }

      // console.log("✅ Payment initiated successfully");
      // console.log("🔗 Checkout URL:", data.checkout_url);

      return data;
    } catch (error) {
      console.error("❌ Payment error:", error);
      throw error;
    }
  }

  async verifyPayment(orderId: string): Promise<VerifyPaymentResponse> {
    try {
      // console.log("🔍 Verifying payment for order:", orderId);

      // Get authentication token
      const authData = await this.authenticate();

      // Verify payment
      const response = await fetch(`${this.config.endpoint}/api/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
        }),
      });

      const data = await response.json();
      // console.log("📥 Verification response:", data);

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${JSON.stringify(data)}`);
      }

      // API returns array, we need first item
      const verificationData = Array.isArray(data) ? data[0] : data;

      // console.log("✅ Payment verified successfully");
      return verificationData;
    } catch (error) {
      console.error("❌ Verification error:", error);
      throw error;
    }
  }
}

export const shurjopay = new ShurjoPay();
export type { PaymentRequest, PaymentResponse, VerifyPaymentResponse };
