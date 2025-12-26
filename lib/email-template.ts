interface RegistrationEmailData {
  orderId: string;
  fullName: string;
  mobileNumber: string;
  participationType: string;
  totalParticipants: string;
  participantBreakdown: {
    adults: number;
    children: number;
    infants: number;
  };
  amount: number;
}

interface PaymentEmailData {
  order_id?: string;
  amount?: string;
  received_amount?: string;
  currency?: string;
  bank_status?: string;
  sp_message?: string;
  customer_order_id?: string;
  name?: string;
  phone_no?: string;
  address?: string;
  city?: string;
  method?: string;
  bank_trx_id?: string;
  date_time?: string;
}

export function generateRegistrationEmail(data: RegistrationEmailData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #059669, #0d9488); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
    .label { font-weight: bold; color: #059669; }
    .value { color: #1f2937; }
    .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>নদী যাত্রা ২০২৬ - নতুন নিবন্ধন</h1>
      <p>নতুন একটি অংশগ্রহণকারী নিবন্ধন করেছে</p>
    </div>
    
    <div class="content">
      <div class="important">
        <h3>⚠️ Important Information</h3>
        <p><strong>Order ID:</strong> ${data.orderId}</p>
        <p><strong>পরিমাণ:</strong> ${data.amount} টাকা</p>
        <p><strong>পূর্ণ নাম:</strong> ${data.fullName}</p>
        <p><strong>মোবাইল:</strong> ${data.mobileNumber}</p>
      </div>

      <h3>অংশগ্রহণের বিস্তারিত</h3>
      
      <div class="field">
        <span class="label">অংশগ্রহণের ধরন:</span>
        <span class="value">${data.participationType}</span>
      </div>

      <div class="field">
        <span class="label">মোট অংশগ্রহণকারী:</span>
        <span class="value">${data.totalParticipants} জন</span>
      </div>

      <div class="field">
        <span class="label">বিস্তারিত:</span>
        <ul>
          <li>প্রাপ্তবয়স্ক: ${data.participantBreakdown.adults} জন</li>
          <li>শিশু (৬-১২ বছর): ${data.participantBreakdown.children} জন</li>
          <li>শিশু (৫ বছরের নিচে): ${data.participantBreakdown.infants} জন</li>
        </ul>
      </div>

      <div class="important">
        <p><strong>💰 মোট পেমেন্ট:</strong> ${data.amount} টাকা</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generatePaymentEmail(data: PaymentEmailData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
    .content { background: #f9fafb; padding: 25px; border-radius: 0 0 8px 8px; }
    .success-badge { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 25px; border: 2px solid #10b981; }
    .field { margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
    .label { font-weight: 600; color: #374151; }
    .value { color: #1f2937; font-weight: 500; }
    .section-title { font-size: 18px; font-weight: bold; color: #059669; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #10b981; }
    .amount-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .amount-box .amount { font-size: 32px; font-weight: bold; color: #065f46; }
    .amount-box .label { font-size: 14px; color: #059669; margin-bottom: 5px; }
    .footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Payment Successful!</h1>
      <p>River Journey 2026 - Registration Payment</p>
    </div>
    
    <div class="content">
      <div class="success-badge">
        ✅ ${data.sp_message || "Payment Successful"}
      </div>

      <div class="amount-box">
        <div class="label">TOTAL AMOUNT RECEIVED</div>
        <div class="amount">${data.received_amount || data.amount || 0} ${
    data.currency || "BDT"
  }</div>
      </div>

      <div class="section-title">📋 Transaction Details</div>
      
      <div class="field">
        <span class="label">Order ID:</span>
        <span class="value">${data.order_id || "N/A"}</span>
      </div>

      <div class="field">
        <span class="label">Customer Order ID:</span>
        <span class="value">${data.customer_order_id || "N/A"}</span>
      </div>

      <div class="field">
        <span class="label">Bank Transaction ID:</span>
        <span class="value">${data.bank_trx_id || "N/A"}</span>
      </div>

      <div class="field">
        <span class="label">Payment Status:</span>
        <span class="value">${data.bank_status || "N/A"}</span>
      </div>

      <div class="field">
        <span class="label">Payment Method:</span>
        <span class="value">${data.method || "N/A"}</span>
      </div>

      <div class="field">
        <span class="label">Transaction Date & Time:</span>
        <span class="value">${data.date_time || "N/A"}</span>
      </div>

      ${
        data.name || data.phone_no || data.address || data.city
          ? `
      <div class="section-title">👤 Customer Information</div>
      
      <div class="info-grid">
        ${
          data.name
            ? `
        <div class="field">
          <span class="label">Name:</span>
          <span class="value">${data.name}</span>
        </div>
        `
            : ""
        }

        ${
          data.phone_no
            ? `
        <div class="field">
          <span class="label">Phone:</span>
          <span class="value">${data.phone_no}</span>
        </div>
        `
            : ""
        }
      </div>

      ${
        data.address || data.city
          ? `
      <div class="field">
        <span class="label">Address:</span>
        <span class="value">${
          [data.address, data.city].filter(Boolean).join(", ") || "N/A"
        }</span>
      </div>
      `
          : ""
      }
      `
          : ""
      }

      <div class="section-title">💰 Payment Summary</div>
      
      <div class="info-grid">
        <div class="field">
          <span class="label">Amount:</span>
          <span class="value">${data.amount || 0} ${
    data.currency || "BDT"
  }</span>
        </div>

        <div class="field">
          <span class="label">Received:</span>
          <span class="value">${data.received_amount || data.amount || 0} ${
    data.currency || "BDT"
  }</span>
        </div>
      </div>

      <div class="footer">
        <p>This is an automated email notification.</p>
        <p>River Journey 2026 | Nadi Yatra</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
