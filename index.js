// Dependencies
const express = require("express");
const mongoose = require("mongoose"); // Import mongoose
const dotenv = require("dotenv"); // Import dotenv
const bodyParser = require("body-parser"); // Import body-parser
const routes = require("./src/routes/index");

const cron = require("node-cron");
const allContacts = require("./src/controller/allContacts");

// Load environment variables from the .env file
dotenv.config();

// Load environment variables
const PORT = process.env.PORT || 3097;
const MONGODB_ATLAS_URL =
  "mongodb+srv://umth5898:RjORsgelUCYj9f4C@cluster0.dxswetf.mongodb.net/wild-Apricot-infoioi";

console.log("Server is running");

// Initialize Express app
const app = express();

// Middleware
app.use(express.urlencoded({ limit: "1000mb", extended: true }));
app.use(bodyParser.text({ limit: "10mb" }));
app.use(bodyParser.json());

// Connect to MongoDB Atlas using mongoose
mongoose.connect(MONGODB_ATLAS_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Schedule a cron job to run every 2 minutes
cron.schedule("*/1 * * * *", async () => {
  // This function will be executed every 2 minutes
  console.log("Fetching events after 2 minutes...");
  try {
    await allContacts.getAccounts();
    console.log("Cron job executed successfully");
  } catch (error) {
    console.error("Error fetching events:", error);
  }
});

// Static files
app.use("/contacts-image", express.static("contacts-image"));
app.use("/cron", async (req, res, next) => {
  try {
    await allContacts.getAccounts()(req, res);
  } catch (error) {
    next(error); // Forward the error to the Express error handler
  }
});
app.use("/", routes);

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
