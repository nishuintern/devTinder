const express = require("express");
const { userAuth } = require("../../middleware/Auth");
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/Razorpay');
const Payment = require("../../models/payment");
const { membershipAmount } = require("../utils/constants"); 

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
    res.json({ ...savedPayment.toJSON(),keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = paymentRouter;
