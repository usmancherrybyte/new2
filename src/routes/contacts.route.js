const express = require("express")
const route = express.Router();
const contactController = require("./../controller/allContacts")
route.post("/update", contactController.update)
module.exports = route;