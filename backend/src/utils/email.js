const env = require('../config/env');

function otpEmailHtml(purposeTitle, code) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">CodeArena</h2>
      <h3 style="color: #334155; margin-bottom: 8px;">${purposeTitle}</h3>
      <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Use the following 6-digit code to complete your request. This code is valid for <strong>10 minutes</strong>.</p>
      <div style="margin: 24px 0; text-align: center; background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">
        ${code}
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">If you did not request this code, please ignore this email.</p>
    </div>`;
}

async function sendEmail(toEmail, subject, htmlContent) {
  console.log(`[EMAIL SERVICE] OTP/Notification for ${toEmail} | Subject: ${subject}`);

  if (!env.email.resendApiKey) {
    console.warn('[RESEND API] RESEND_API_KEY is not configured. Logging email output to console only.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.email.from,
        to: [toEmail],
        subject,
        html: htmlContent,
      }),
    });
    const body = await response.text();
    if (!response.ok) {
      console.error(`[RESEND API ERROR] Failed to send email to ${toEmail}: ${body}`);
    } else {
      console.log(`[RESEND API SUCCESS] Email sent to ${toEmail}.`);
    }
  } catch (err) {
    console.error(`[RESEND API ERROR] Failed to send email to ${toEmail}:`, err.message);
  }
}

async function sendOtp(toEmail, code, purposeTitle) {
  await sendEmail(toEmail, `CodeArena — ${purposeTitle}`, otpEmailHtml(purposeTitle, code));
}

module.exports = { sendOtp, sendEmail };
