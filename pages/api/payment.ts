// /pages/api/payment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { makePayment } from 'shurjopay-js';
import { shurjopayConfig } from '../../lib/shurjopay-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const orderDetails = req.body;
            const paymentResponse = await makePayment(orderDetails.orderId, orderDetails.formData);
            return res.status(200).json(paymentResponse);
        } catch (error) {
            console.error('Error making payment:', error);
            return res.status(500).json({ message: 'Error processing payment' });
        }
    }
    res.status(405).json({ message: 'Method Not Allowed' });
}
