import nodemailer from "nodemailer";

function getBaseUrl() {
    if (process.env.APP_URL) {
        return process.env.APP_URL;
    }
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const hostname = process.env.VERCEL_URL || 'localhost';
    const port = process.env.PORT || 3000;
    return `${protocol}://${hostname}${port === '80' || port === '443' ? '' : `:${port}`}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export async function sendVerificationEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const link = `${getBaseUrl()}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Verify Your Email - Dr. Rajesh Sharma's Clinic",
        html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111;">Email Verification</h2>
            <p>Click the link below to verify your account:</p>
            <a href="${link}" style="display: inline-block; background: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
         </div>
        `
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export async function sendAppointmentNotificationEmail(appointmentData) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const formattedDate = formatDate(appointmentData.date);
    
    const shiftTimes = {
        'Morning (9 AM - 1 PM)': '9:00 AM - 1:00 PM',
        'Evening (4 PM - 8 PM)': '4:00 PM - 8:00 PM'
    };

    const timeDisplay = appointmentData.displayTime || appointmentData.shift;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CLINIC_EMAIL || process.env.SMTP_USER,
        subject: `New Appointment Request - ${appointmentData.name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #111; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">New Appointment Request</h2>
                <p style="margin: 8px 0 0; opacity: 0.8;">${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 120px;">Patient Name</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">${escapeHtml(appointmentData.name)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Phone</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                            <a href="tel:${escapeHtml(appointmentData.phone)}" style="color: #111; text-decoration: none;">${escapeHtml(appointmentData.phone)}</a>
                        </td>
                    </tr>
                    ${appointmentData.email ? `
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Email</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                            <a href="mailto:${escapeHtml(appointmentData.email)}" style="color: #111; text-decoration: none;">${escapeHtml(appointmentData.email)}</a>
                        </td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">${formattedDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Time Slot</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                            <strong>${timeDisplay}</strong><br>
                            <span style="color: #666; font-size: 14px;">${shiftTimes[appointmentData.shift] || ''}</span>
                            ${appointmentData.preferredTime ? `<br><span style="color: #059669; font-size: 13px;">Preferred Time: ${appointmentData.preferredTime}</span>` : ''}
                        </td>
                    </tr>
                    ${appointmentData.message ? `
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; vertical-align: top;">Message</td>
                        <td style="padding: 12px 0;">${escapeHtml(appointmentData.message)}</td>
                    </tr>
                    ` : ''}
                </table>
                
                ${appointmentData.appointmentId ? `
                <p style="margin-top: 20px; font-size: 12px; color: #888;">
                    Appointment ID: ${appointmentData.appointmentId}
                </p>
                ` : ''}
            </div>
            
            <div style="background: #e8f5e9; padding: 16px; border-radius: 0 0 12px 12px; border: 1px solid #c8e6c9;">
                <p style="margin: 0; color: #2e7d32; font-size: 14px;">
                    <strong>Action Required:</strong> Please contact the patient to confirm their appointment slot.
                </p>
            </div>
        </div>
        `
    });
}

export async function sendAppointmentConfirmationEmail(appointmentData, patientEmail) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const formattedDate = formatDate(appointmentData.date);
    
    const shiftTimes = {
        'Morning (9 AM - 1 PM)': '9:00 AM - 1:00 PM',
        'Evening (4 PM - 8 PM)': '4:00 PM - 8:00 PM'
    };

    const timeDisplay = appointmentData.shiftStart && appointmentData.shiftEnd
        ? `${appointmentData.shiftStart} - ${appointmentData.shiftEnd}`
        : (shiftTimes[appointmentData.shift] || '');

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: patientEmail,
        subject: `Appointment Confirmed - ${formattedDate}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #059669; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h2 style="margin: 0;">Appointment Confirmed</h2>
                <p style="margin: 8px 0 0; opacity: 0.9;">Dr. Rajesh Sharma's Clinic</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="font-size: 16px;">Dear ${escapeHtml(appointmentData.name)},</p>
                <p style="font-size: 14px; color: #666;">Your appointment has been <strong style="color: #059669;">confirmed</strong>. Please find the details below:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">Date</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Time</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                ${appointmentData.shift}<br>
                                <span style="color: #059669; font-size: 15px; font-weight: 600;">${timeDisplay}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Doctor</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">Dr. Rajesh Sharma</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold;">Location</td>
                            <td style="padding: 10px 0;">123 Health Avenue, Medical District, Indore</td>
                        </tr>
                    </table>
                </div>
                
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                        <strong>Important:</strong> Please arrive 10-15 minutes early for your appointment.
                    </p>
                </div>
                
                <p style="font-size: 14px; color: #666;">For any queries or to reschedule, call us at:</p>
                <p style="font-size: 18px; font-weight: bold; color: #111;">${escapeHtml(process.env.CLINIC_PHONE) || '+91 98765 43210'}</p>
            </div>
            
            <div style="background: #111; color: white; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">This is an automated confirmation. Please save this email for your reference.</p>
            </div>
        </div>
        `
    });
}

export async function sendAppointmentStatusEmail(appointmentData, patientEmail, status) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const formattedDate = formatDate(appointmentData.date);
    
    const shiftTimes = {
        'Morning (9 AM - 1 PM)': '9:00 AM - 1:00 PM',
        'Evening (4 PM - 8 PM)': '4:00 PM - 8:00 PM'
    };

    const timeDisplay = appointmentData.shiftStart && appointmentData.shiftEnd
        ? `${appointmentData.shiftStart} - ${appointmentData.shiftEnd}`
        : (shiftTimes[appointmentData.shift] || '');

    const statusConfig = {
        confirmed: {
            color: '#059669',
            bgColor: '#ecfdf5',
            title: 'Appointment Confirmed',
            message: 'Your appointment has been confirmed. Please find the details below:',
            icon: '✓'
        },
        cancelled: {
            color: '#dc2626',
            bgColor: '#fef2f2',
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled. Please contact us if you need to reschedule.',
            icon: '✕'
        },
        completed: {
            color: '#7c3aed',
            bgColor: '#f5f3ff',
            title: 'Appointment Completed',
            message: 'Your appointment has been marked as completed. Thank you for visiting.',
            icon: '✓'
        },
        'no-show': {
            color: '#f59e0b',
            bgColor: '#fffbeb',
            title: 'Appointment Missed',
            message: 'Your appointment was marked as missed. Please contact us to reschedule.',
            icon: '!'
        }
    };

    const config = statusConfig[status] || statusConfig.confirmed;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: patientEmail,
        subject: `${config.title} - ${formattedDate}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${config.color}; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h2 style="margin: 0;">${config.title}</h2>
                <p style="margin: 8px 0 0; opacity: 0.9;">Dr. Rajesh Sharma's Clinic</p>
            </div>
            
            <div style="background: ${config.bgColor}; padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="font-size: 16px;">Dear ${escapeHtml(appointmentData.name)},</p>
                <p style="font-size: 14px; color: #666;">${config.message}</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">Date</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Time</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                ${appointmentData.shift}<br>
                                <span style="color: ${config.color}; font-size: 15px; font-weight: 600;">${timeDisplay}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; font-weight: bold;">Status</td>
                            <td style="padding: 10px 0;">
                                <span style="color: ${config.color}; font-weight: 600; text-transform: uppercase;">${status}</span>
                            </td>
                        </tr>
                    </table>
                </div>
                
                ${status === 'cancelled' || status === 'no-show' ? `
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                        Please contact us to reschedule your appointment at your earliest convenience.
                    </p>
                </div>
                ` : ''}
                
                <p style="font-size: 14px; color: #666;">For any queries, call us at:</p>
                <p style="font-size: 18px; font-weight: bold; color: #111;">${escapeHtml(process.env.CLINIC_PHONE) || '+91 98765 43210'}</p>
            </div>
            
            <div style="background: #111; color: white; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">This is an automated notification. Please save this email for your reference.</p>
            </div>
        </div>
        `
    });
}
