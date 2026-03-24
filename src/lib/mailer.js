import nodemailer from "nodemailer";

function getBaseUrl() {
    if (process.env.APP_URL) return process.env.APP_URL;
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const hostname = process.env.VERCEL_URL || 'localhost';
    const port = process.env.PORT || 3000;
    return `${protocol}://${hostname}${port === '80' || port === '443' ? '' : `:${port}`}`;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

let transporter = null;

function createTransporter() {
    if (transporter) return transporter;

    const port = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = port === 465;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: isSecure,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false }
    });

    transporter.verify((error) => {
        if (error) {
            console.log('SMTP Transporter verification failed:', error.message);
        } else {
            console.log('SMTP Transporter is ready');
        }
    });

    return transporter;
}

const styles = {
    primary: '#3b82f6',
    dark: '#1e293b',
    muted: '#64748b',
    light: '#f8fafc',
    white: '#ffffff',
    border: '#e2e8f0'
};

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${styles.light};">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: ${styles.light}; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: ${styles.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="background: ${styles.primary}; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: ${styles.white};">Dr. Rajesh Sharma's Clinic</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            ${content}
                        </td>
                    </tr>
                    <tr>
                        <td style="background: ${styles.dark}; padding: 20px 30px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #94a3b8;">123 Health Avenue, Medical District, Indore</p>
                            <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">This is an automated message. Please do not reply to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const card = (content) => `<table width="100%" cellpadding="0" cellspacing="0" style="background: ${styles.light}; padding: 20px; border-radius: 8px; margin: 16px 0;">${content}</table>`;

export async function sendVerificationEmail(email, token) {
    const transporter = createTransporter();
    const link = `${getBaseUrl()}/verify-email?token=${token}`;

    const content = `
        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${styles.dark};">Verify Your Email</h2>
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${styles.muted};">Thank you for registering. Please verify your email address to get started.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
            <tr>
                <td align="center">
                    <a href="${link}" style="display: inline-block; background: ${styles.primary}; color: ${styles.white}; padding: 12px 28px; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 8px;">Verify Email</a>
                </td>
            </tr>
        </table>
        <p style="margin: 0; font-size: 13px; color: ${styles.muted};">Link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Verify Your Email - Dr. Rajesh Sharma's Clinic",
        html: emailTemplate(content)
    });
}

export async function sendAppointmentNotificationEmail(appointmentData) {
    const transporter = createTransporter();
    const recipientEmail = process.env.CLINIC_EMAIL || process.env.SMTP_USER;
    const formattedDate = formatDate(appointmentData.date);

    const content = `
        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${styles.dark};">New Appointment Request</h2>
        <p style="margin: 0 0 16px; font-size: 15px; color: ${styles.muted};">A new appointment request has been received.</p>
        ${card(`
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding: 8px 0;"><strong>Patient:</strong> ${appointmentData.name}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Phone:</strong> <a href="tel:${appointmentData.phone}" style="color: ${styles.primary};">${appointmentData.phone}</a></td></tr>
                ${appointmentData.email ? `<tr><td style="padding: 8px 0;"><strong>Email:</strong> ${appointmentData.email}</td></tr>` : ''}
                <tr><td style="padding: 8px 0;"><strong>Date:</strong> ${formattedDate}</td></tr>
                <tr><td style="padding: 8px 0;"><strong>Time:</strong> ${appointmentData.displayTime || appointmentData.shift}</td></tr>
                ${appointmentData.message ? `<tr><td style="padding: 8px 0;"><strong>Message:</strong> ${appointmentData.message}</td></tr>` : ''}
            </table>
        `)}
        <p style="margin: 0; font-size: 14px; color: #b45309;">Please contact the patient to confirm their appointment.</p>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: `New Appointment - ${appointmentData.name}`,
        html: emailTemplate(content)
    });
}

export async function sendAppointmentAcknowledgementEmail(appointmentData, recipientEmail) {
    const transporter = createTransporter();
    const formattedDate = formatDate(appointmentData.date);

    const content = `
        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${styles.dark};">Hello ${appointmentData.name},</h2>
        <p style="margin: 0 0 16px; font-size: 15px; color: ${styles.muted};">Thank you for choosing our clinic. We have received your appointment request.</p>
        ${card(`
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding: 6px 0;"><strong>Date:</strong> ${formattedDate}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Time:</strong> ${appointmentData.preferredTime || appointmentData.shift}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Status:</strong> <span style="color: #b45309;">Pending</span></td></tr>
            </table>
        `)}
        <p style="margin: 0; font-size: 14px; color: ${styles.muted};">We will contact you soon to confirm your appointment.</p>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: "Appointment Request Received",
        html: emailTemplate(content)
    });
}

export async function sendAppointmentConfirmationEmail(appointmentData, patientEmail) {
    const transporter = createTransporter();
    const formattedDate = formatDate(appointmentData.date);

    const content = `
        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${styles.dark};">Dear ${appointmentData.name},</h2>
        <p style="margin: 0 0 16px; font-size: 15px; color: ${styles.muted};">Your appointment has been <strong style="color: #10b981;">confirmed</strong>!</p>
        ${card(`
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding: 6px 0;"><strong>Date:</strong> ${formattedDate}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Time:</strong> ${appointmentData.shift}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Location:</strong> 123 Health Avenue, Indore</td></tr>
            </table>
        `)}
        <p style="margin: 0; font-size: 14px; color: ${styles.muted};">Please arrive 10-15 minutes early.</p>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: patientEmail,
        subject: `Appointment Confirmed - ${formattedDate}`,
        html: emailTemplate(content)
    });
}

export async function sendAppointmentStatusEmail(appointmentData, patientEmail, status, reason = '') {
    const transporter = createTransporter();
    const formattedDate = formatDate(appointmentData.date);

    const statusInfo = {
        confirmed: { color: '#10b981', title: 'Appointment Confirmed', msg: 'We look forward to seeing you!' },
        cancelled: { color: '#ef4444', title: 'Appointment Cancelled', msg: reason || 'Please contact us to reschedule.' },
        completed: { color: '#8b5cf6', title: 'Appointment Completed', msg: 'Thank you for visiting us.' },
        'no-show': { color: '#f59e0b', title: 'Appointment Missed', msg: 'Please contact us to reschedule.' }
    };

    const info = statusInfo[status] || statusInfo.confirmed;

    const content = `
        <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${styles.dark};">Dear ${appointmentData.name},</h2>
        <p style="margin: 0 0 16px; font-size: 15px; color: ${styles.muted};"><strong style="color: ${info.color};">${info.title}</strong><br/>${info.msg}</p>
        ${card(`
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding: 6px 0;"><strong>Date:</strong> ${formattedDate}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Time:</strong> ${appointmentData.shift}</td></tr>
            </table>
        `)}
        <p style="margin: 0; font-size: 14px; color: ${styles.muted};">For queries, call: ${process.env.CLINIC_PHONE || '+91 98765 43210'}</p>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: patientEmail,
        subject: `${info.title} - ${formattedDate}`,
        html: emailTemplate(content)
    });
}
