
import "server-only";
import nodemailer from "nodemailer";

const VERIFICATION_EXPIRY_MINUTES = 30;

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM;
  const appUrl = process.env.NEXTAUTH_URL;

  if (!smtpUser || !smtpPassword || !emailFrom || !appUrl) {
    throw new Error("Email configuration is incomplete.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const verificationUrl = new URL("/verify-email", appUrl);
  verificationUrl.searchParams.set("token", token);

  await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: "Verify your MedOrch email address",
    text: [
      `Hello ${name},`,
      "",
      "Thank you for registering with MedOrch.",
      "",
      "Verify your email address using the following link:",
      verificationUrl.toString(),
      "",
      `This link expires in ${VERIFICATION_EXPIRY_MINUTES} minutes.`,
      "",
      "After verification, your account will remain pending",
      "until an administrator approves it.",
      "",
      "If you did not register for MedOrch, ignore this email.",
      "",
      "MedOrch Team",
    ].join("\n"),
  });
}
