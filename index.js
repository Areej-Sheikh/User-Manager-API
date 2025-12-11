require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { connect } = require("./src/db/database");
const usersRouter = require("./src/routes/users");
const { errorHandler } = require("./src/middlewares/errorHandler");

console.log("=================================");
console.log("🚀 Starting Backend Server...");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=================================");

const allowedOrigins = [
  "http://localhost:5173",
  "https://user-manager-ui.vercel.app",
  "https://user-manager-bdbv6vwb1-areej-fatima.vercel.app",
];

const app = express();

// EXTRA LOGGING
app.use((req, res, next) => {
  console.log(
    `\n[${new Date().toISOString()}] Incoming Request → ${req.method} ${
      req.url
    }`
  );
  console.log("Headers:", req.headers);
  next();
});

app.use(
  cors({
    origin: function (origin, cb) {
      console.log("[CORS] Origin:", origin);

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost")
      ) {
        console.log("[CORS] Allowed");
        cb(null, true);
      } else {
        console.log("[CORS] BLOCKED:", origin);
        cb(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  console.log("[ROOT] / endpoint called");
  res.send("CRUD Backend running");
});

// Error handler
app.use(errorHandler);

// DB Connection + Server
const PORT = process.env.PORT || 5000;
connect().then(() => {
  console.log("[DB] Connected successfully");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
