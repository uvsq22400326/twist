import nodemailer from "nodemailer";

// Create a transporter (email sending configuration)
const transporter = nodemailer.createTransport({
  // For Gmail
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Use app password for Gmail
  },
});

/**
 * Send verification email with token link
 */
export async function sendVerificationEmail(email: string, token: string) {
  // Create the verification URL
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email for Twist",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1DA1F2;">Welcome to Twist!</h1>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #1DA1F2; 
                 color: white; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
        <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
        <p>If you did not create this account, please ignore this email.</p>
      </div>
    `,
  };

  console.log(`Sending verification email to ${email} with token ${token}`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
}
