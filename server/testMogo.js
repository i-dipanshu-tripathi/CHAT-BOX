const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://dipanshu_tripathi:vWurosX6zRnvWaFM@chat-box-cluster.kncwhpt.mongodb.net/CHAT_BOX_DB?retryWrites=true&w=majority&appName=CHAT-BOX-CLUSTER",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("✅ Connected to MongoDB Atlas successfully");
  process.exit(0);
});

db.on("error", (err) => {
  console.log("❌ MongoDB connection failed:", err);
  process.exit(1);
});
