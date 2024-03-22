// This code will Load environment variables from .env file
require('dotenv').config();

// This code will import SendGrid mail service
const sgMail = require('@sendgrid/mail');

// This code will import Google Cloud Firestore service
const { Firestore } = require('@google-cloud/firestore');

// This will initializes the Firestore database connection
const firestore = new Firestore();

// The main Cloud Function that's executed upon Pub/Sub trigger
exports.sendWelcomeAndSaveToFirestore = (message, context) => {
  // This code will decode the message data from base64
  const incomingMessage = Buffer.from(message.data, 'base64').toString('utf-8');

  // This code will parse the JSON string into an object
  const parsedMessage = JSON.parse(incomingMessage);

  // This code will log the parsed message and email address to the console
  console.log(`Decoded message: ${JSON.stringify(parsedMessage)}`);
  console.log(`Email address: ${parsedMessage.email_address}`);

  // This code will set the API key for SendGrid from environment variables
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  // Construct the email message object
  const emailMsg = {
    to: parsedMessage.email_address, // Set the recipient of the email
    from: process.env.SENDGRID_SENDER, // Set the sender address from environment variables
    subject: "Thanks for signing up for TravelDeals!",
    text: "Thanks for signing up. We can't wait to share deals with you.",
    html: "Thanks for signing up. We can't wait to share <strong>awesome</strong> deals with you."
  };

  // This code will send the email message using SendGrid
  sgMail
    .send(emailMsg)
    .then(() => {
      // Email was sent successfully
      console.log(`Welcome email sent to ${parsedMessage.email_address}`);
    }, error => {
      // Handle errors when sending the email
      console.error(error);
      if (error.response) {
        // Log full response if available
        console.error(error.response.body);
      }
    });

  // This code will add the subscriber data to the Firestore 'subscribers' collection
  const subscriberRef = firestore.collection('subscribers').doc(parsedMessage.email_address);
  subscriberRef.set({
    email_address: parsedMessage.email_address, // Set the email address field
    watch_regions: parsedMessage.watch_regions // Set the watch regions field (array of strings)
  })
  .then(() => {
    // This code will log success message on adding to Firestore
    console.log(`New subscriber added to Firestore with email: ${parsedMessage.email_address}`);
  })
  .catch((error) => {
    // This code will handle errors when writing to Firestore
    console.error(`Error adding subscriber to Firestore: ${error}`);
  });
};
