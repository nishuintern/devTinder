const express = require("express");
const app = express();
const dbConnect = require("../config/db");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();
const PORT = 7777;
const cors = require("cors");
// app.use(cors({ origin: "http://localhost:5173",credentials: true }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://devtinder-web-zkxd.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // If using cookies/session/JWT in headers
  })
);

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
const paymentRouter = require("./routes/payment");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", paymentRouter);

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
