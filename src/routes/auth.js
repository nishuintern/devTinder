const express = require("express");
const { validatorSignup } = require("../utils/validation");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const cookie = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

authRouter.post("/signup", async (req, res) => {
  try {
    validatorSignup(req);
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({
      message: "User Added Successfully!!!",
      data: savedUser,
      success: true,
    });
  } catch (error) {
    res.status(404).json({
      message: "Signup Failed!!" + error.message,
      success: false,
    });
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
      // res.status(200).json({ message: "Login successfully!!!", token });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(404).send("Login Failed!!" + error.message);
  }
});
authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.status(200).send("Logout successfully!");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = authRouter;
