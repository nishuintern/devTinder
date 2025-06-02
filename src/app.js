const express = require("express");
const app = express();
const dbConnect = require("../config/db");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();
const PORT = process.env.PORT;
const cors = require("cors");

// --- CORS FIX START ---
const corsOptions = {
  origin: [
    "http://localhost:5173", // local frontend
    "https://devtinder-web-zkxd.onrender.com", // <-- replace with your deployed frontend URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
// --- CORS FIX END ---

app.use(express.json());
app.use(cookieParser());
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
