// utils/sms.js

require('dotenv').config();
const twilio = require('twilio');

// Load from global app.locals if available (set in server.js), else fallback
let client;
let fromPhone;

if (global.twilioClient && process.env.TWILIO_PHONE) {
  client = global.twilioClient;
  fromPhone = process.env.TWILIO_PHONE;
} else {
  const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;

  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
    console.error("❌ Twilio config missing. Check your .env file.");
    process.exit(1);
  }

  client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
  fromPhone = TWILIO_PHONE;
}

// ✅ Function to send SMS
async function sendSMS(to, message) {
  try {
    if (!to || !message) {
      throw new Error("Phone number or message is missing.");
    }

    const formattedNumber = to.startsWith('+') ? to : `+91${to}`;
    console.log(`📤 Sending SMS to ${formattedNumber}...`);

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedNumber,
    });

    console.log("✅ SMS sent successfully. SID:", result.sid);
    return result;

  } catch (err) {
    console.error("❌ Failed to send SMS:", err.message);
    throw err;
  }
}

module.exports = { sendSMS };
