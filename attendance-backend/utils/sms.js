// utils/sms.js

require('dotenv').config();
const twilio = require('twilio');

// ✅ Validate environment variables early
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;

if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
  console.error("❌ Twilio config missing. Check your .env file.");
  process.exit(1);
}

// ✅ Initialize Twilio client
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// ✅ Function to send SMS
async function sendSMS(to, message) {
  try {
    if (!to || !message) {
      throw new Error("Phone number or message is missing.");
    }

    // Format number to E.164 if not already
    const formattedNumber = to.startsWith('+') ? to : `+91${to}`;

    console.log(`📤 Sending SMS to ${formattedNumber}...`);

    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: formattedNumber,
    });

    console.log("✅ SMS sent successfully. SID:", result.sid);
    return result;

  } catch (err) {
    console.error("❌ Failed to send SMS:", err.message);
    throw err; // ❗ Let the caller handle the error
  }
}

module.exports = { sendSMS };
