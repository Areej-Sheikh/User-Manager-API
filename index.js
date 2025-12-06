require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { connect } = require("./src/db/database");
const usersRouter = require("./src/routes/users");
const { errorHandler } = require("./src/middlewares/errorHandler");


const app = express();
app.use(express.json());
app.use(cors());
app.use(
  cors({
    origin: "https://user-manager-ui.vercel.app",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/users", usersRouter);

app.get("/", (req, res) => res.send("CRUD Backend running"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
