const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');
const orders = require('../models/DigitalCardProfile');

dotenv.config();

const router = express.Router();

// Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



router.post('/create-order', async (req, res) => {
  try {
    const { applicationId } = req.body;

    // 🔍 1. Get amount from DB
    const application = await orders.findOne({ where: { id: applicationId } });

    if (!application || !application.price) {
      return res.status(404).json({ error: 'Application or amount not found' });
    }

    const amount = Math.round(application.price * 100); // Convert to paisa

    // 🧾 2. Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${applicationId}_${Date.now()}`,
    });

    // 💾 3. Save Razorpay order ID to DB
    await orders.update(
      { razorpayOrderId: razorpayOrder.id },
      { where: { id: applicationId } }
    );

    // 📤 4. Respond with order details
    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});


// ✅ 2. Verify Razorpay Signature
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      applicationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 👉 Signature generation logic
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Optional debug log
    console.log('Expected Signature:', generatedSignature);
    console.log('Received Signature:', razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update DB as paid
    await orders.update(
      {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: 'paid',
        status: 'approved',
      },
      { where: { id: applicationId } }
    );

    res.status(200).json({ success: true, message: 'Payment verified',razorpay_signature });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;
