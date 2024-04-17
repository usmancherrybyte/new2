const express = require("express");
const router = express.Router();
const contactRoutes = require("./contacts.route");

router.use("/contact", contactRoutes);

module.exports = router;