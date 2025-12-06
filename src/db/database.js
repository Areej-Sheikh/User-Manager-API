const mongoose = require("mongoose");

async function connect() {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Connecting to MongoDB...");

    await mongoose.connect(uri);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = { connect };
