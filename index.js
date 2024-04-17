const express = require("express");

const PORT = process.env.PORT || 3071;

console.log("Server is running");

// Initialize Express app
const app = express();
// app.use("/", (req, res) => {
//   res.json({ message: "Hello, Express.js!" });
// });
app.get("/check", (req, res) => {
  res.json({ message: "get" });
});
app.post("/post", (req, res) => {
  res.json({ message: "post" });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
