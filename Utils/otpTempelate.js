const generateOtpEmail = (otp, userName = "User") => {
  const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; background-color: #ffffff; color: #333;">
      <header style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #007BFF; margin: 0;">SaferSavvy</h1>
        <p style="font-size: 14px; color: #777;">Empowering safer digital access for everyone</p>
      </header>

      <section>
        <h2 style="color: #333;">👋 Hello ${userName},</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for choosing <strong>SaferSavvy</strong>. To proceed securely with your login, please use the following One-Time Password (OTP):
        </p>

        <div style="font-size: 32px; font-weight: bold; color: #007BFF; margin: 30px 0; text-align: center;">
          ${otp}
        </div>

        <p style="font-size: 15px; color: #555;">
          🔐 This OTP is valid for <strong>15 seconds</strong> only. Please enter it promptly to continue. For your security, never share this code with anyone – not even SaferSavvy staff.
        </p>
      </section>

      <section style="margin-top: 30px;">
        <p style="font-size: 14px; color: #999;">
          If you did not request this login attempt, please disregard this email. No action is needed if you did not initiate this request.
        </p>
      </section>

      <footer style="margin-top: 40px; font-size: 12px; text-align: center; color: #aaa; border-top: 1px solid #ddd; padding-top: 20px;">
        <p>© ${currentYear} SaferSavvy. All rights reserved.</p>
        <p>SaferSavvy is a secure access platform helping users verify and log in with confidence.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>
  `;
};

module.exports = generateOtpEmail;
