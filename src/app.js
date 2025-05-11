const express = require("express");
const app = express();
const dbConnect = require("../config/db");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();
const PORT = process.env.PORT;
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
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/Chat");
const { configDotenv } = require("dotenv");
const paymentRouter = require("./routes/payments");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use('/',paymentRouter)

const server = http.createServer(app);
initializeSocket(server);

dbConnect()
  .then(() => {
    try {
      console.log("DB is Connected");
      server.listen(PORT, () => {
        console.log(`Server Running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.log(error);
    }
  })
  .catch((err) => {
    console.log(err);
  });
