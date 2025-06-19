const mongoose = require("mongoose");

// ! Connection logic
mongoose.connect(process.env.CONN_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
});

// ! Connection state
const db = mongoose.connection;

// ! Check DB Connection
db.on("connected", () => {
  console.log("DB connection is connected successfully");
});

db.on("error", () => {
  console.log("DB connection failed");
});

module.exports = db;
