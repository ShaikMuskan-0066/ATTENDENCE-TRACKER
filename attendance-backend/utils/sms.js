const twilio = require('twilio');
require('dotenv').config();

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

function sendSMS(to, message) {
  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: `+91${to}`
  });
}

module.exports = { sendSMS };
