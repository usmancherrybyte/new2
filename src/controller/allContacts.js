const axios = require("axios");
const { Buffer } = require("buffer");
const path = require("path");
const fs = require("fs");
const ContactImage = require("../models/contactImage");
// Load environment variables from the .env file
const dotenv = require("dotenv"); // Import dotenv
dotenv.config(); // Configure dotenv
const { WILD_API, SERVER_URL } = process.env;

const getToken = async () => {
  try {
    console.log("WILD_API", WILD_API);
    const authHeader = `Basic ${Buffer.from(`APIKEY:${WILD_API}`).toString(
      "base64"
    )}`;

    const response = await axios.post(
      "https://oauth.wildapricot.org/auth/token",
      "grant_type=client_credentials&scope=auto",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
      }
    );

    accessToken = response.data.access_token;
    console.log("accessToken", accessToken);
    if (response.data.access_token) {
      return accessToken;
    }
  } catch (error) {
    console.log("error", error);
  }
};

exports.getAccounts = async () => {
  const token = await getToken();
  console.log("token", token);

  try {
    const response = await axios.get(
      `https://api.wildapricot.com/v2.1/accounts/191317/contacts?$async=false&%24filter=Status%20eq%20'Active'`,
      {
        headers: {
          "User-Agent": "MySampleApplication/0.1",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // const contactsData = response.data.Contacts;
    const parentContacts = response.data.Contacts;
    const childContacts = await ContactImage.find().sort({ updatedAt: 1 });
    const newContacts = [];
    const alreadyExists = [];

    for (const parentContact of parentContacts) {
      const existingChildContact = childContacts.find(
        (childContact) => childContact.wildapricotUserId === parentContact.Id
      );

      if (!existingChildContact) {
        newContacts.push(parentContact);
      }
      else {
        alreadyExists.push(parentContact)
      }
    }

    const allContacts = [...newContacts, ...alreadyExists]
    for (let i = 0; i < allContacts.length; i++) {
      const contact = allContacts[i];
      // console.log("ProfileLastUpdated:", contact.ProfileLastUpdated);

      const existingImage = await ContactImage.findOne({
        wildapricotUserId: contact.Id,
      });

      if (contact.FieldValues[49].Value.Url) {
        const imageName = contact.FieldValues[49].Value.Id;
        const imageResponse = await axios.get(
          contact.FieldValues[49].Value.Url,
          {
            responseType: "arraybuffer",
            headers: {
              "User-Agent": "MySampleApplication/0.1",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const imagePath = path.join(
          __dirname, '..', '..', 'contacts-image',

          `${imageName}`
        );

        fs.writeFileSync(imagePath, imageResponse.data);
        console.log("Image saved:", imagePath);

        if (!existingImage) {
          const newImage = new ContactImage({
            wildapricotUserId: contact.Id,
            wildapricotUrl: contact.FieldValues[49].Value.Url,
            localUrl: `${SERVER_URL}/contacts-image/${imageName}`,
            updatedAt: Date.now()
          });
          await newImage.save();
        } else {
          // Update timestamp in MongoDB and url
          existingImage.updatedAt = Date.now();
          existingImage.localUrl = `${SERVER_URL}/contacts-image/${imageName}`
          await existingImage.save();
        }
      } else {
        console.log("Field data doesn't have a value");
      }
    }
    return;
  } catch (error) {
    console.log("error", error);
  }
};


exports.update = async (req, res) => {
  try {
    const { contactID, image } = req.body
    const imageData = Buffer.from(image, 'base64');
    const imagePath = path.join(__dirname, '..', '..', 'contacts-image', `image_${contactID}.png`);
    fs.writeFile(imagePath, imageData, function (err) {
      if (err) {
        console.error('Error:', err);
        res.status(500).send("Image uploading to local machene failed")
        return
      } else {
        console.log('Image saved successfully!');
        //This response must be removed when wildapricot error  resolved 
        res.status(200).send("okey")
      }
    });
    // This is used to upload file on wildApricot
    // (async function () {
    //   try {
    //       const token = await getToken(); 
    //       const response = await axios.post(
    //           `https://api.wildapricot.com/v2.1/accounts/191317/attachments/Upload`,
    //          [{

    //               name: String(contactId),
    //               MimeType: "image/png",
    //               Data: {file:image}
    //           }],
    //           {

    //               headers: {
    //                   "User-Agent": "MySampleApplication/0.1",
    //                   Accept: "application/json",
    //                   Authorization: `Bearer ${token}`,
    //               },
    //           }
    //       );

    //       console.log('Response:', response.data);
    //       res.status(200).send(response.data)
    //   } catch (error) {
    //       console.error('Error:', error);
    //       res.status(500).send("wild apicot internal server error")
    //   }
    // })();

  } catch (error) {
    console.log("error", error);
    res.status(500).send("internal server error")
  }
};