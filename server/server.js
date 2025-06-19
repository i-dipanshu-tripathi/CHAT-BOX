const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const server = require("./app");
const dbconfig = require("./config/dbConfig");

const PORT = process.env.PORT_NUMBER || 3001;

server.listen(PORT, () => {
  console.log(`Listening to the requests on the PORT : ${PORT}`);
});
