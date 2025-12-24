// shurjopay_config.js
const shurjopay_config = {
  SP_ENDPOINT:
    process.env.NEXT_PUBLIC_SP_ENDPOINT || "https://sandbox.shurjopayment.com",
  SP_USERNAME: process.env.SP_USERNAME || "sp_sandbox",
  SP_PASSWORD: process.env.SP_PASSWORD || "pyyk97hu&6u6",
  SP_PREFIX: process.env.NEXT_PUBLIC_SP_PREFIX || "sp",
  SP_RETURN_URL: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`
    : "http://localhost:3000/payment/callback",
};

export { shurjopay_config };
