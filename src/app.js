const express = require("express");
const app = express();
const dbConnect = require("../config/db");
const cookieParser = require("cookie-parser");
require('dotenv').config()
const PORT = 8000;
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
// const corsOptions = {
//   origin: "http://localhost:3000",
//   method: "POST GET PUT DELETE PATCH",
//   credentials: true,
// };
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const { configDotenv } = require("dotenv");
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
dbConnect()
  .then(() => {
    try {
      console.log("DB is Connected");
      app.listen(PORT, () => {
        console.log(`Server Running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.log(error);
    }
  })
  .catch((err) => {
    console.log(err);
  });
