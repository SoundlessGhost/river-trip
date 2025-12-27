// lib/email-template.ts

interface ShurjoPayVerifyResponse {
  bank_status?: string;
  sp_message?: string;
  order_id?: string;
  sp_order_id?: string;
  transaction_id?: string;
  amount?: string;
  customer_name?: string;
  customer_phone?: string;
  [key: string]: unknown;
}

interface RegistrationData {
  id: string;
  fullName: string;
  mobileNumber: string;
  participationType: string;
  totalParticipants: number;
  adults: number;
  children: number;
  infants: number;
  amount: number;
  paymentStatus: string;
  createdAt: Date;
}

export function generateAdminEmail(
  paymentResponse: ShurjoPayVerifyResponse,
  registration?: RegistrationData
): string {
  const participationTypeMap: Record<string, string> = {
    single: "একক (রংপুর)",
    family: "পরিবারসহ (রংপুর)",
    Guest: "অথিতি",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #059669;
        }
        .section h2 {
          margin-top: 0;
          color: #059669;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #4b5563;
        }
        .value {
          color: #1f2937;
          text-align: right;
        }
        .amount-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .amount-box .amount { font-size: 32px; font-weight: bold; color: #065f46; }
        .amount-box .label { font-size: 14px; color: #059669; margin-bottom: 5px; }
        .success-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .footer {
          background: #f3f4f6;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ নদী যাত্রা ২০২৬</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">PAYMENT CONFIRMATION</p>
        </div>

        <div class="amount-box">
        <div class="label">TOTAL AMOUNT RECEIVED</div>
        <div class="amount">${
          paymentResponse.received_amount || paymentResponse.amount || 0
        } ${paymentResponse.currency || "BDT"}</div>
      </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="success-badge">PAYMENT SUCCESSFUL</span>
          </div>

          ${
            registration
              ? `
          <!-- Registration Information -->
          <div class="section">
            <h2>📋 Registration Details</h2>
            <div class="info-row">
              <span class="label">নাম:</span>
              <span class="value">${registration.fullName}</span>
            </div>
            <div class="info-row">
              <span class="label">মোবাইল নম্বর:</span>
              <span class="value">${registration.mobileNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">অংশগ্রহণের ধরন:</span>
              <span class="value">${
                participationTypeMap[registration.participationType] ||
                registration.participationType
              }</span>
            </div>
            <div class="info-row">
              <span class="label">মোট অংশগ্রহণকারী:</span>
              <span class="value">${registration.totalParticipants} জন</span>
            </div>
          </div>

          <!-- Participant Breakdown -->
          <div class="section">
            <h2>👥 অংশগ্রহণকারীদের বিস্তারিত</h2>
            <div class="info-row">
              <span class="label">প্রাপ্তবয়স্ক (13+ বছর):</span>
              <span class="value">${registration.adults} জন</span>
            </div>
            <div class="info-row">
              <span class="label">শিশু (৬-১২ বছর):</span>
              <span class="value">${registration.children} জন</span>
            </div>
            <div class="info-row">
              <span class="label">শিশু (৫ বছরের নিচে):</span>
              <span class="value">${registration.infants} জন</span>
            </div>
          </div>
          `
              : ""
          }

          <!-- Payment Information -->
          <div class="section">
            <h2>💳 Payment Information</h2>
            <div class="info-row">
              <span class="label">Order ID:</span>
              <span class="value">${paymentResponse.order_id || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${
                paymentResponse.sp_order_id ||
                paymentResponse.transaction_id ||
                "N/A"
              }</span>
            </div>
            <div class="info-row">
              <span class="label">Amount:</span>
              <span class="value">${
                registration
                  ? registration.amount
                  : paymentResponse.amount || "N/A"
              } টাকা</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value" style="color: #10b981; font-weight: bold;">${
                paymentResponse.bank_status ||
                paymentResponse.sp_message ||
                "SUCCESS"
              }</span>
            </div>
            ${
              registration
                ? `
            <div class="info-row">
              <span class="label">Registration Date:</span>
              <span class="value">${new Date(
                registration.createdAt
              ).toLocaleString("bn-BD")}</span>
            </div>
            `
                : ""
            }
          </div>

          <!-- Event Details -->
          <div class="section">
            <h2>🚢 Event Information</h2>
            <div class="info-row">
              <span class="label">Event:</span>
              <span class="value">নদী যাত্রা ২০২৬</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">১৭ জানুয়ারি ২০২৬ (শনিবার)</span>
            </div>
            <div class="info-row">
              <span class="label">Organized by:</span>
              <span class="value">রংপুর জেলা সমিতি, ঢাকা</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>© ২০২৬ রংপুর জেলা সমিতি, ঢাকা</p>
          <p style="margin: 5px 0 0 0;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateUserEmail(
  paymentResponse: ShurjoPayVerifyResponse,
  registration: RegistrationData
): string {
  const participationTypeMap: Record<string, string> = {
    single: "একক (রংপুর)",
    family: "পরিবারসহ (রংপুর)",
    Guest: "অথিতি",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .success-icon { font-size: 60px; margin-bottom: 20px; }
        .message { text-align: center; font-size: 18px; color: #374151; margin-bottom: 30px; }
        .info-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1fae5; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #065f46; }
        .value { color: #047857; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .event-details { background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>রেজিস্ট্রেশন সফল!</h1>
          <p style="margin: 10px 0 0 0;">নদী যাত্রা ২০২৬</p>
        </div>


        
        <div class="content">
          <p class="message">
            প্রিয় <strong>${registration.fullName}</strong>,<br>
            আপনার রেজিস্ট্রেশন এবং পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। ধন্যবাদ!
          </p>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #059669;">📋 আপনার তথ্য</h3>
            <div class="info-row"><span class="label">নাম:</span><span class="value">${
              registration.fullName
            }</span></div>
            <div class="info-row"><span class="label">মোবাইল:</span><span class="value">${
              registration.mobileNumber
            }</span></div>
           
            <div class="info-row"><span class="label">অংশগ্রহণ:</span><span class="value">${
              participationTypeMap[registration.participationType]
            }</span></div>
            <div class="info-row"><span class="label">মোট ব্যক্তি:</span><span class="value">${
              registration.totalParticipants
            } জন</span></div>
            <div class="info-row"><span class="label">পেমেন্ট:</span><span class="value"><strong>${
              registration.amount
            } টাকা</strong></span></div>
          </div>

          <div class="event-details">
            <h3 style="margin-top: 0; color: #1e40af;">🚢 ইভেন্টের বিস্তারিত</h3>
            <p style="margin: 5px 0;"><strong>📅 তারিখ:</strong> ১৭ জানুয়ারি ২০২৬ (শনিবার)</p>
            <p style="margin: 5px 0;"><strong>📍 স্থান:</strong> মেঘনা নদী</p>
            <p style="margin: 5px 0;"><strong>👥 আয়োজক:</strong> রংপুর জেলা সমিতি, ঢাকা</p>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>📌 গুরুত্বপূর্ণ:</strong> ইভেন্টের দিন এই ইমেইল অথবা পেমেন্ট রসিদ সাথে রাখুন।
            </p>
          </div>

          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>
        
        <div class="footer">
          <p>© ২০২৬ রংপুর জেলা সমিতি, ঢাকা</p>
          <p style="margin: 5px 0 0 0;">নদী মেঘনার জলরাশিতে শেকড়ের মিলনমেলা</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// interface registration {
//   orderId: string;
//   fullName: string;
//   mobileNumber: string;
//   participationType: string;
//   totalParticipants: string;
//   participantBreakdown: {
//     adults: number;
//     children: number;
//     infants: number;
//   };
//   amount: number;
// }

// interface PaymentEmailData {
//   order_id?: string;
//   amount?: string;
//   received_amount?: string;
//   currency?: string;
//   bank_status?: string;
//   sp_message?: string;
//   customer_order_id?: string;
//   name?: string;
//   phone_no?: string;
//   address?: string;
//   city?: string;
//   method?: string;
//   bank_trx_id?: string;
//   date_time?: string;
// }

// export function generateRegistrationEmail(data: RegistrationEmailData) {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <style>
//     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//     .header { background: linear-gradient(to right, #059669, #0d9488); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
//     .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
//     .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
//     .label { font-weight: bold; color: #059669; }
//     .value { color: #1f2937; }
//     .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <h1>নদী যাত্রা ২০২৬ - নতুন নিবন্ধন</h1>
//       <p>নতুন একটি অংশগ্রহণকারী নিবন্ধন করেছে</p>
//     </div>

//     <div class="content">
//       <div class="important">
//         <h3>⚠️ Important Information</h3>
//         <p><strong>Order ID:</strong> ${data.orderId}</p>
//         <p><strong>পরিমাণ:</strong> ${data.amount} টাকা</p>
//         <p><strong>পূর্ণ নাম:</strong> ${data.fullName}</p>
//         <p><strong>মোবাইল:</strong> ${data.mobileNumber}</p>
//       </div>

//       <h3>অংশগ্রহণের বিস্তারিত</h3>

//       <div class="field">
//         <span class="label">অংশগ্রহণের ধরন:</span>
//         <span class="value">${data.participationType}</span>
//       </div>

//       <div class="field">
//         <span class="label">মোট অংশগ্রহণকারী:</span>
//         <span class="value">${data.totalParticipants} জন</span>
//       </div>

//       <div class="field">
//         <span class="label">বিস্তারিত:</span>
//         <ul>
//           <li>প্রাপ্তবয়স্ক: ${data.participantBreakdown.adults} জন</li>
//           <li>শিশু (৬-১২ বছর): ${data.participantBreakdown.children} জন</li>
//           <li>শিশু (৫ বছরের নিচে): ${data.participantBreakdown.infants} জন</li>
//         </ul>
//       </div>

//       <div class="important">
//         <p><strong>💰 মোট পেমেন্ট:</strong> ${data.amount} টাকা</p>
//       </div>
//     </div>
//   </div>
// </body>
// </html>
//   `;
// }

// export function generatePaymentEmail(data: PaymentEmailData) {
//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <style>
//     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//     .header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
//     .header h1 { margin: 0; font-size: 28px; }
//     .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
//     .content { background: #f9fafb; padding: 25px; border-radius: 0 0 8px 8px; }
//     .success-badge { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 25px; border: 2px solid #10b981; }
//     .field { margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
//     .label { font-weight: 600; color: #374151; }
//     .value { color: #1f2937; font-weight: 500; }
//     .section-title { font-size: 18px; font-weight: bold; color: #059669; margin: 25px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #10b981; }
//     .amount-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
//     .amount-box .amount { font-size: 32px; font-weight: bold; color: #065f46; }
//     .amount-box .label { font-size: 14px; color: #059669; margin-bottom: 5px; }
//     .footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
//     .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
//     @media (max-width: 600px) {
//       .info-grid { grid-template-columns: 1fr; }
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <h1>🎉 Payment Successful!</h1>
//       <p>River Journey 2026 - Registration Payment</p>
//     </div>

//     <div class="content">
//       <div class="success-badge">
//         ✅ ${data.sp_message || "Payment Successful"}
//       </div>

//       <div class="amount-box">
//         <div class="label">TOTAL AMOUNT RECEIVED</div>
//         <div class="amount">${data.received_amount || data.amount || 0} ${
//     data.currency || "BDT"
//   }</div>
//       </div>

//       <div class="section-title">📋 Transaction Details</div>

//       <div class="field">
//         <span class="label">Order ID:</span>
//         <span class="value">${data.order_id || "N/A"}</span>
//       </div>

//       <div class="field">
//         <span class="label">Customer Order ID:</span>
//         <span class="value">${data.customer_order_id || "N/A"}</span>
//       </div>

//       <div class="field">
//         <span class="label">Bank Transaction ID:</span>
//         <span class="value">${data.bank_trx_id || "N/A"}</span>
//       </div>

//       <div class="field">
//         <span class="label">Payment Status:</span>
//         <span class="value">${data.bank_status || "N/A"}</span>
//       </div>

//       <div class="field">
//         <span class="label">Payment Method:</span>
//         <span class="value">${data.method || "N/A"}</span>
//       </div>

//       <div class="field">
//         <span class="label">Transaction Date & Time:</span>
//         <span class="value">${data.date_time || "N/A"}</span>
//       </div>

//       ${
//         data.name || data.phone_no || data.address || data.city
//           ? `
//       <div class="section-title">👤 Customer Information</div>

//       <div class="info-grid">
//         ${
//           data.name
//             ? `
//         <div class="field">
//           <span class="label">Name:</span>
//           <span class="value">${data.name}</span>
//         </div>
//         `
//             : ""
//         }

//         ${
//           data.phone_no
//             ? `
//         <div class="field">
//           <span class="label">Phone:</span>
//           <span class="value">${data.phone_no}</span>
//         </div>
//         `
//             : ""
//         }
//       </div>

//       ${
//         data.address || data.city
//           ? `
//       <div class="field">
//         <span class="label">Address:</span>
//         <span class="value">${
//           [data.address, data.city].filter(Boolean).join(", ") || "N/A"
//         }</span>
//       </div>
//       `
//           : ""
//       }
//       `
//           : ""
//       }

//       <div class="section-title">💰 Payment Summary</div>

//       <div class="info-grid">
//         <div class="field">
//           <span class="label">Amount:</span>
//           <span class="value">${data.amount || 0} ${
//     data.currency || "BDT"
//   }</span>
//         </div>

//         <div class="field">
//           <span class="label">Received:</span>
//           <span class="value">${data.received_amount || data.amount || 0} ${
//     data.currency || "BDT"
//   }</span>
//         </div>
//       </div>

//       <div class="footer">
//         <p>This is an automated email notification.</p>
//         <p>River Journey 2026 | Nadi Yatra</p>
//       </div>
//     </div>
//   </div>
// </body>
// </html>
//   `;
// }
