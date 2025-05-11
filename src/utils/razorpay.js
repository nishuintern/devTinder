const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Enter the Key Secret generated from the Dashboard
});

module.exports = instance;