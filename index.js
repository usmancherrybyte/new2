const express = require("express");

const PORT = 3071;

console.log("Server is running");

// Initialize Express app
const app = express();
app.use("/", (req, res) => {
  res.json({ message: "Hello, Express.js!" });
});
app.get("/check", (req, res) => {
  res.json({ message: "Hello, Express.js!2" });
});
app.get("/post", (req, res) => {
  res.json({ message: "Hello, Express.js!2" });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
