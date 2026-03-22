import twilio from "twilio";

const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_TOKEN
);

export async function sendSMS(phone, message) {
    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: phone
    });
}

export async function sendWhatsAppMsg(phone, message) {
    await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_PHONE}`,
        to: `whatsapp:${phone}`
    });
}