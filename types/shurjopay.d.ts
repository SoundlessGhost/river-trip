declare module "shurjopay-js" {
  export interface ShurjopayConfig {
    SP_ENDPOINT: string;
    SP_USERNAME: string;
    SP_PASSWORD: string;
    SP_PREFIX: string;
    SP_RETURN_URL: string;
  }

  export interface MakePaymentResponse {
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
  }

  export interface VerifyPaymentResponse {
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

  export interface PaymentData {
    amount: number;
    currency?: string;
    customer_name: string;
    customer_address: string;
    customer_city: string;
    customer_phone: string;
    customer_email: string;
    customer_state?: string;
    customer_postcode?: string;
    discount_amount?: number;
    disc_percent?: number;
    value1?: string;
    value2?: string;
    value3?: string;
    value4?: string;
  }

  export function makePayment(
    orderId: string,
    paymentData: PaymentData
  ): Promise<MakePaymentResponse>;

  export function verifyPayment(
    spOrderId: string
  ): Promise<VerifyPaymentResponse>;
}
