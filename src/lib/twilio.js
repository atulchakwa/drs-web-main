import twilio from "twilio";

let client = null;

function getTwilioClient() {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) {
        return null;
    }
    if (!client) {
        client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    }
    return client;
}

export async function sendSMS(phone, message) {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
        throw new Error("Twilio is not configured");
    }
    await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: phone
    });
}

export async function sendWhatsAppMsg(phone, message) {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
        throw new Error("Twilio is not configured");
    }
    await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE}`,
        to: `whatsapp:${phone}`
    });
}