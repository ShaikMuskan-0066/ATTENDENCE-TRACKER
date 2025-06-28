// utils/sms.js

async function sendSMS(app, to, message) {
  try {
    if (!to || !message) throw new Error("Phone number or message is missing.");

    const client = app.locals.twilioClient;
    const fromPhone = app.locals.twilioPhone;

    if (!client || !fromPhone) {
      throw new Error("Twilio client not initialized in app.locals.");
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
