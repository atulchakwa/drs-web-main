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
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createTransporter() {
    const port = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = port === 465;

    console.log(`Creating transporter: host=${process.env.SMTP_HOST}, port=${port}, secure=${isSecure}`);

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: isSecure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
}

export async function sendVerificationEmail(email, token) {
    const transporter = createTransporter();

    const link = `${getBaseUrl()}/verify-email?token=${token}`;

    console.log(`Sending verification email to ${email}`);
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
    // Only send if email is provided
    const recipientEmail = process.env.CLINIC_EMAIL || process.env.SMTP_USER;

    const transporter = createTransporter();

    const formattedDate = formatDate(appointmentData.date);

    const shiftTimes = {
        'Morning (9 AM - 1 PM)': '9:00 AM - 1:00 PM',
        'Evening (4 PM - 8 PM)': '4:00 PM - 8:00 PM'
    };

    const timeDisplay = appointmentData.displayTime || appointmentData.shift;

    console.log(`Sending notification to clinic: ${recipientEmail}`);
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
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

export async function sendAppointmentAcknowledgementEmail(appointmentData, recipientEmail) {
    const transporter = createTransporter();

    const formattedDate = formatDate(appointmentData.date);
    const timeDisplay = appointmentData.preferredTime
        ? `${appointmentData.preferredTime} (within ${appointmentData.shift})`
        : appointmentData.shift;

    console.log(`Sending acknowledgment to patient: ${recipientEmail}`);
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: `Appointment Request Received - Dr. Rajesh Sharma's Clinic`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: #111; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Appointment Requested</h1>
                <p style="margin: 10px 0 0; opacity: 0.8;">We have received your request, ${escapeHtml(appointmentData.name)}.</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 40px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
                <p>Hello,</p>
                <p>Thank you for choosing Dr. Rajesh Sharma's Clinic. We have received your appointment request and our staff will review it shortly.</p>
                
                <div style="background: white; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #eee;">
                    <h3 style="margin-top: 0; color: #111; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Request Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Date:</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: bold;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Time Slot:</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: bold;">${timeDisplay}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Status:</td>
                            <td style="padding: 10px 0; text-align: right;"><span style="background: #fff8e1; color: #b7791f; padding: 4px 12px; rounded: 8px; font-weight: bold; font-size: 12px;">PENDING CONFIRMATION</span></td>
                        </tr>
                    </table>
                </div>
                
                <p style="font-size: 14px; color: #666; line-height: 1.6;">
                    <strong>What happens next?</strong><br>
                    Our administrative team will check the availability for your chosen slot and contact you via phone or email to confirm the final time.
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    If you need to change or cancel this request, please call us at <a href="tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE}" style="color: #111; font-weight: bold; text-decoration: none;">${process.env.NEXT_PUBLIC_CLINIC_PHONE}</a>.
                </p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
                    Dr. Rajesh Sharma's Clinic<br>
                    Providing Quality Healthcare for Your Family
                </div>
            </div>
        </div>
        `
    });
}

export async function sendAppointmentConfirmationEmail(appointmentData, patientEmail) {
    const transporter = createTransporter();

    const formattedDate = formatDate(appointmentData.date);

    const shiftTimes = {
        'Morning (9 AM - 1 PM)': '9:00 AM - 1:00 PM',
        'Evening (4 PM - 8 PM)': '4:00 PM - 8:00 PM'
    };

    const timeDisplay = appointmentData.shiftStart && appointmentData.shiftEnd
        ? `${appointmentData.shiftStart} - ${appointmentData.shiftEnd}`
        : (shiftTimes[appointmentData.shift] || '');

    console.log(`Sending confirmation to patient: ${patientEmail}`);
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

export async function sendAppointmentStatusEmail(appointmentData, patientEmail, status, reason = '') {
    const transporter = createTransporter();

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
            message: reason ? `Your appointment has been cancelled. Reason: ${escapeHtml(reason)}` : 'Your appointment has been cancelled. Please contact us if you need to reschedule.',
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
                
                ${status === 'cancelled' ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${getBaseUrl()}/#appointment" style="display: inline-block; background: #536de6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(83,109,230,0.2);">Book New Appointment</a>
                </div>
                ` : ''}

                ${status === 'cancelled' || status === 'no-show' ? `
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                        Please contact us to reschedule your appointment at your earliest convenience if you haven't booked a new one already.
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
