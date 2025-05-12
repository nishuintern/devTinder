const express = require("express");
const { userAuth } = require("../../middleware/Auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/Razorpay");
const Payment = require("../../models/payment");
const { membershipAmount } = require("../utils/constants");
const { validateWebhookSignature } = require("razorpay");
const user = require("../../models/User");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });
    // const order = await razorpayInstance.orders.create({
    //   amount:  600, // amount in smallest currency unit
    //   currency: "INR",
    //   receipt: "receipt#1",
    //   notes: {
    //     firstName:"Nishu",
    //     lastName:"Singh",
    //     emailId:"nishu@gmail.com",
    //     membershipType:"premium",
    //   },
    // });
    // save it in DB
    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("x-razorpay-signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ msg: "Invalid Webhook Signature" });
    }
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });
    payment.status = paymentDetails.status;
    await payment.save();

    const user = await user.findOne({
      _id: payment.userId,
    });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    // if (req.body.event === "payment.captured") {
    // }
    // if (req.body.event === "payment.failed") {
    // }
    return res.status(200).json({ msg: "Webhook Received" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

paymentRouter.get("/premium/verify", userAuth, (req, res) => {
  const user = req.user.toJSON();
  if (user.isPremium) {
    return res.json({ ...user , isPremium: true });
  }
  return res.json({ ...user,isPremium: false });
});
module.exports = paymentRouter;
