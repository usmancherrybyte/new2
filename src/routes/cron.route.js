const cron = require("node-cron");
const allContacts = require("../controller/allContacts");

const startCronJob = () => {
  // Define the cron job
  cron.schedule("*/2 * * * *", async () => {
    // This function will be executed every 2 minutes
    console.log("Fetching events after 2 minutes...");
    try {
      await allContacts.getAccounts();
      //await allEvents.getEvents();
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  });
};

module.exports = startCronJob;
